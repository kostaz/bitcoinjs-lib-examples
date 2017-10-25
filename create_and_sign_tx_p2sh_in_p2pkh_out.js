// This programs extracts bitcoins from a multisig address,
// sending them to a normal address, using programmatic tools.
//
// This program creates a raw transaction that has one input and
// one output (and implicit fee).
//
// The input is from the address: 2MsmYhydevN7Bhn4RTxucBfB9bYj5xcHUV8
// constructed from the '2 out of 3' multisig script script from the
// 3 public keys:
// 025E7369F26B275AFDDEF181D4BE0A1DFBABF098380249AA8A033CB240B0F70B75,
// 02AA275C9054E1342D16EF18CACC34886D23C47C0B2F5D53D1ECEE98B8DD58FAA5,
// 02C2275371EBAA36F09D0E7B576993896982D42D7C7D05244592BC6ABCE9518999.
//
// One of paying tx outputs is:
// ['1dad1c8052566e945d0af799f6ce89eb8e2affbf76615eb26f3f8fd814b86262', 1].
//
// The transaction’s input with only 2 private keys:
// cQaGzue6uhNknUxL6is5pbfH4fiEKVQ6mbuA5b1SBmsSbvhzCynA and
// cPG49GFsvKezrZDko1ZuVDbSa5CHbGjyM82iFrUCHZuT771j1yAf (correspond to the
// first two public keys).
//
// The output of the transaction will send all of the bitcoins (minus fee)
// to this address: mi33KHtdWhchxjDxcAqaRJCZAWznMGHKw4.
//
// The raw transaction is sent to bitcoind (Bitcoin Core) in 'testnet' mode.

var bitcoin = require('bitcoinjs-lib');
var btcrpc = require('bitcoin')
var testnet = bitcoin.networks.testnet

var keyPair1 = bitcoin.ECPair.fromWIF('cQaGzue6uhNknUxL6is5pbfH4fiEKVQ6mbuA5b1SBmsSbvhzCynA', testnet);
var keyPair2 = bitcoin.ECPair.fromWIF('cPG49GFsvKezrZDko1ZuVDbSa5CHbGjyM82iFrUCHZuT771j1yAf', testnet);

var pubkBuf1 = new Buffer('025E7369F26B275AFDDEF181D4BE0A1DFBABF098380249AA8A033CB240B0F70B75', 'hex');
var pubkBuf2 = new Buffer('02AA275C9054E1342D16EF18CACC34886D23C47C0B2F5D53D1ECEE98B8DD58FAA5', 'hex');
var pubkBuf3 = new Buffer('02C2275371EBAA36F09D0E7B576993896982D42D7C7D05244592BC6ABCE9518999', 'hex');

var pubKeyBufs = [pubkBuf1, pubkBuf2, pubkBuf3];
var redeemScript = bitcoin.script.multisig.output.encode(2, pubKeyBufs);

var txb = new bitcoin.TransactionBuilder(testnet);
txb.addInput('1dad1c8052566e945d0af799f6ce89eb8e2affbf76615eb26f3f8fd814b86262', 1);
txb.addOutput('mi33KHtdWhchxjDxcAqaRJCZAWznMGHKw4', 99600000); // fee 500000 satoshi
txb.sign(0, keyPair1, redeemScript);
txb.sign(0, keyPair2, redeemScript);

var tx = txb.build();
console.log(tx.toHex());

var client = new btcrpc.Client({
    host: 'localhost',
    port: 8332,
    user: 'kosta',
    pass: '123456',
    timeout: 30000,
    network: 'testnet',
});

var txhex = tx.toHex();

client.sendRawTransaction(txhex, function(err, resHeaders) {
    if (err)
        console.log(err);
});

import {
  isSameOriginAbsoluteUrl,
  isLaterVersion,
  intToHexString,
  hexToBytes,
  bytesToHex,
  fromTwos,
  toTwos,
  toBuffer,
  intToBigInt,
} from '../src'
import { BN } from 'bn.js';

test('isLaterVersion', () => {
  expect(isLaterVersion('', '1.1.0')).toEqual(false)
  expect(isLaterVersion('1.2.0', '1.1.0')).toEqual(true)
  expect(isLaterVersion('1.1.0', '1.1.0')).toEqual(true)
  expect(isLaterVersion('1.1.0', '1.2.0')).toEqual(false)
})

test('isSameOriginAbsoluteUrl', () => {
  expect(isSameOriginAbsoluteUrl('http://example.com', 'http://example.com/')).toEqual(true)
  expect(isSameOriginAbsoluteUrl('https://example.com', 'https://example.com/')).toEqual(true)
  expect(isSameOriginAbsoluteUrl('http://example.com', 'http://example.com/manifest.json')).toEqual(true)
  expect(isSameOriginAbsoluteUrl('https://example.com', 'https://example.com/manifest.json')).toEqual(true)
  expect(isSameOriginAbsoluteUrl('http://localhost:3000', 'http://localhost:3000/manifest.json')).toEqual(true)
  expect(isSameOriginAbsoluteUrl('http://app.example.com', 'http://app.example.com/manifest.json')).toEqual(true)
  expect(isSameOriginAbsoluteUrl('http://app.example.com:80', 'http://app.example.com/manifest.json')).toEqual(true)
  expect(isSameOriginAbsoluteUrl('https://app.example.com:80', 'https://app.example.com:80/manifest.json')).toEqual(true)
  
  expect(isSameOriginAbsoluteUrl('http://example.com', 'https://example.com/')).toEqual(false)
  expect(isSameOriginAbsoluteUrl('http://example.com', 'http://example.com:1234')).toEqual(false)
  expect(isSameOriginAbsoluteUrl('http://app.example.com', 'https://example.com/manifest.json')).toEqual(false)
})

test('intToHexString', () => {
  const expected = '0000000000000010';

  expect(intToHexString(BigInt(16))).toEqual(expected);
  expect(intToHexString(16)).toEqual(expected);
});

test('hexToBytes & bytesToHex', () => {
  const hex = 'ff';
  const bytes = Uint8Array.of(255);

  expect(hexToBytes(hex)).toEqual(bytes);
  expect(bytesToHex(bytes)).toEqual(hex);
});

test('should return proper buffer', () => {
  const n = BigInt('0x123456');

  expect(toBuffer(n, 5).toString('hex')).toBe('0000123456');

  const s = '211e1566be78319bb949470577c2d4';

  for (let i = 1; i <= s.length; i++) {
    const slice = (i % 2 === 0 ? '' : '0') + s.slice(0, i);
    const bn = BigInt(`0x${slice}`);
    expect(toBuffer(bn).toString('hex')).toBe(slice.padStart(32, '0'))
  }
});

test('should convert from two\'s complement to negative number', () => {
  expect(Number(fromTwos(BigInt('0x00000000'),32))).toBe(0);
  expect(Number(fromTwos(BigInt('0x00000001'),32))).toBe(1);
  expect(Number(fromTwos(BigInt('0x7fffffff'),32))).toBe(2147483647);
  expect(Number(fromTwos(BigInt('0x80000000'),32))).toBe(-2147483648);
  expect(Number(fromTwos(BigInt('0xf0000000'),32))).toBe(-268435456);
  expect(Number(fromTwos(BigInt('0xf1234567'),32))).toBe(-249346713);
  expect(Number(fromTwos(BigInt('0xffffffff'),32))).toBe(-1);
  expect(Number(fromTwos(BigInt('0xfffffffe'),32))).toBe(-2);
  expect(Number(fromTwos(BigInt('0xfffffffffffffffffffffffffffffffe'),128))).toBe(-2);
  expect(Number(fromTwos(BigInt('0xffffffffffffffffffffffffffffffff' +
    'fffffffffffffffffffffffffffffffe'),256))).toBe(-2);
  expect(Number(fromTwos(BigInt('0xffffffffffffffffffffffffffffffff' +
    'ffffffffffffffffffffffffffffffff'),256))).toBe(-1);
  expect(
    fromTwos(BigInt('0x7fffffffffffffffffffffffffffffff' +
      'ffffffffffffffffffffffffffffffff'),256).toString(10))
    .toEqual(BigInt('5789604461865809771178549250434395392663499' +
    '2332820282019728792003956564819967').toString(10));
  expect(
    fromTwos(BigInt('0x80000000000000000000000000000000' +
      '00000000000000000000000000000000'),256).toString(10))
    .toEqual(BigInt('-578960446186580977117854925043439539266349' +
      '92332820282019728792003956564819968').toString(10));
});

test('should convert from negative number to two\'s complement', () => {
  expect(toTwos(BigInt(0), 32).toString(16)).toEqual('0');
  expect(toTwos(BigInt(1), 32).toString(16)).toEqual('1');
  expect(toTwos(BigInt(2147483647), 32).toString(16)).toEqual('7fffffff');
  expect(toTwos(BigInt(-2147483648), 32).toString(16)).toEqual('80000000');
  expect(toTwos(BigInt(-268435456), 32).toString(16)).toEqual('f0000000');
  expect(toTwos(BigInt(-249346713), 32).toString(16)).toEqual('f1234567');
  expect(toTwos(BigInt(-1), 32).toString(16)).toEqual('ffffffff');
  expect(toTwos(BigInt(-2), 32).toString(16)).toEqual('fffffffe');
  expect(toTwos(BigInt(-2), 128).toString(16)).toEqual('fffffffffffffffffffffffffffffffe');
  expect(toTwos(BigInt(-2), 256).toString(16))
    .toEqual('fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe');
  expect(toTwos(BigInt(-1), 256).toString(16))
    .toEqual('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  expect(toTwos(BigInt('5789604461865809771178549250434395392663' +
    '4992332820282019728792003956564819967'), 256).toString(16))
    .toEqual('7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
  expect(toTwos(BigInt('-578960446186580977117854925043439539266' +
    '34992332820282019728792003956564819968'), 256).toString(16))
    .toEqual('8000000000000000000000000000000000000000000000000000000000000000');
});

test('Should accept bn.js instance', () => {
  const value = '123456';
  const bn = new BN(value);
  // After removing bn.js library verify backward compatibility for users passing bn.js instance
  // Should not break if bn.js instance is passed
  const nativeBigInt = intToBigInt(bn, false);

  expect(nativeBigInt.toString()).toEqual(value);
});

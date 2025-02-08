/* eslint-disable sonarjs/no-duplicate-string */
export const CheckoutABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "controller",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        internalType: "contract IWorldID",
        name: "_worldId",
        type: "address",
      },
      {
        internalType: "string",
        name: "_appId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_actionId",
        type: "string",
      },
      {
        internalType: "contract IERC20",
        name: "_token",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "id",
        type: "bytes16",
      },
      {
        internalType: "bytes32",
        name: "h",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "purchase_limit",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "payee",
        type: "address",
      },
    ],
    name: "addProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "id",
        type: "bytes16",
      },
    ],
    name: "hashOf",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "id",
        type: "bytes16",
      },
    ],
    name: "hashOfReview",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "id",
        type: "bytes16",
      },
    ],
    name: "makePayment",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "id",
        type: "bytes16",
      },
      {
        internalType: "address",
        name: "signal",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "root",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nullifierHash",
        type: "uint256",
      },
      {
        internalType: "uint256[8]",
        name: "proof",
        type: "uint256[8]",
      },
    ],
    name: "makePaymentWorldId",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "addr",
        type: "address",
      },
    ],
    name: "payout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "id",
        type: "bytes16",
      },
    ],
    name: "removeProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "product_id",
        type: "bytes16",
      },
      {
        internalType: "bytes16",
        name: "id",
        type: "bytes16",
      },
      {
        internalType: "bytes32",
        name: "h",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "signal",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "root",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nullifierHash",
        type: "uint256",
      },
      {
        internalType: "uint256[8]",
        name: "proof",
        type: "uint256[8]",
      },
    ],
    name: "submitReview",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes16",
        name: "id",
        type: "bytes16",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "purchase_limit",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "payee",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "new_h",
        type: "bytes32",
      },
    ],
    name: "updateProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ShareWrapper, ShareWrapperInterface } from "../ShareWrapper";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lshare",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610828806100206000396000f3fe608060405234801561001057600080fd5b50600436106100675760003560e01c80635b023168116100505780635b023168146100a557806370a08231146100d6578063a694fc3a1461010957610067565b806318160ddd1461006c5780632e1a7d4d14610086575b600080fd5b610074610126565b60408051918252519081900360200190f35b6100a36004803603602081101561009c57600080fd5b503561012c565b005b6100ad6101d1565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b610074600480360360208110156100ec57600080fd5b503573ffffffffffffffffffffffffffffffffffffffff166101ed565b6100a36004803603602081101561011f57600080fd5b5035610215565b60015490565b336000908152600260205260409020548181101561017b5760405162461bcd60e51b81526004018080602001828103825260368152602001806107bd6036913960400191505060405180910390fd5b600154610188908361027b565b600155610195818361027b565b3360008181526002602052604081209290925590546101cd9173ffffffffffffffffffffffffffffffffffffffff90911690846102d8565b5050565b60005473ffffffffffffffffffffffffffffffffffffffff1681565b73ffffffffffffffffffffffffffffffffffffffff1660009081526002602052604090205490565b600154610222908261036a565b6001553360009081526002602052604090205461023f908261036a565b3360008181526002602052604081209290925590546102789173ffffffffffffffffffffffffffffffffffffffff9091169030846103cb565b50565b6000828211156102d2576040805162461bcd60e51b815260206004820152601e60248201527f536166654d6174683a207375627472616374696f6e206f766572666c6f770000604482015290519081900360640190fd5b50900390565b6040805173ffffffffffffffffffffffffffffffffffffffff8416602482015260448082018490528251808303909101815260649091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167fa9059cbb00000000000000000000000000000000000000000000000000000000179052610365908490610466565b505050565b6000828201838110156103c4576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b9392505050565b6040805173ffffffffffffffffffffffffffffffffffffffff80861660248301528416604482015260648082018490528251808303909101815260849091019091526020810180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff167f23b872dd00000000000000000000000000000000000000000000000000000000179052610460908590610466565b50505050565b60606104c8826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff166105249092919063ffffffff16565b805190915015610365578080602001905160208110156104e757600080fd5b50516103655760405162461bcd60e51b815260040180806020018281038252602a815260200180610793602a913960400191505060405180910390fd5b6060610533848460008561053b565b949350505050565b60608247101561057c5760405162461bcd60e51b815260040180806020018281038252602681526020018061076d6026913960400191505060405180910390fd5b610585856106c2565b6105d6576040805162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015290519081900360640190fd5b600060608673ffffffffffffffffffffffffffffffffffffffff1685876040518082805190602001908083835b6020831061064057805182527fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe09092019160209182019101610603565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d80600081146106a2576040519150601f19603f3d011682016040523d82523d6000602084013e6106a7565b606091505b50915091506106b78282866106c8565b979650505050505050565b3b151590565b606083156106d75750816103c4565b8251156106e75782518084602001fd5b8160405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610731578181015183820152602001610719565b50505050905090810190601f16801561075e5780820380516001836020036101000a031916815260200191505b509250505060405180910390fdfe416464726573733a20696e73756666696369656e742062616c616e636520666f722063616c6c5361666545524332303a204552433230206f7065726174696f6e20646964206e6f742073756363656564426f617264726f6f6d3a20776974686472617720726571756573742067726561746572207468616e207374616b656420616d6f756e74a2646970667358221220e5d740d2ebb4caea1fb6c370eb567dc4e5cd42ae70d9362f625eec67e357c27a64736f6c634300060c0033";

export class ShareWrapper__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ShareWrapper> {
    return super.deploy(overrides || {}) as Promise<ShareWrapper>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ShareWrapper {
    return super.attach(address) as ShareWrapper;
  }
  connect(signer: Signer): ShareWrapper__factory {
    return super.connect(signer) as ShareWrapper__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ShareWrapperInterface {
    return new utils.Interface(_abi) as ShareWrapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ShareWrapper {
    return new Contract(address, _abi, signerOrProvider) as ShareWrapper;
  }
}

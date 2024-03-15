import { Contract, ContractRunner } from "ethers";
import abi from "./abi.json";

export function getContract(signer: ContractRunner) {
    return new Contract(
        "0xd9b9e2cc85681d60d5b9e279da4029ea8981b649",
        abi as any,
        signer
    );
}
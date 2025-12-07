import Controls from "./Controls.ts";

export class ComputerControls implements Controls{
    forward(): boolean {
        return true;
    }
    left(): boolean {
        return false;
    }
    right(): boolean {
        return false;
    }
    reverse(): boolean {
        return false;
    }
}
import { proxy } from "valtio";

export const configuration = proxy({
    SCAN_TIMEOUT : 10000
})
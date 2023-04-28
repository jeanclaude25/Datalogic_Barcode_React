import { proxy } from "valtio";

export const configuration = proxy({
    SCAN_TIMEOUT : 10000,
    SCAN_IS_HERE : null
})
export const GRAVE_TICKER = 'GRAVE';
export const XSHARE_TICKER = 'XSHARE';
export const XBOND_TICKER = 'XBOND';
export const FTM_TICKER = 'FTM';
export const USDC_TICKER = 'USDC';
export const SPOOKY_ROUTER_ADDR = '0xF491e7B69E4244ad4002BC14e878a34207E38c29';
export const ZAPPER_ROUTER_ADDR = '0x42dA21a3a7Bc249340B356595813ae5F17082ee8';
export const TAX_OFFICE_ADDR = '0xcaf6C0FB8Bcb737C2D5D7e5Db615147a26091De1';
export const GRAVE_NODE_MULTIPLIER = 1;

export const useGetMultiplierForNode = (tokenName: string) => {
    if (tokenName === 'GRAVE') {
      return GRAVE_NODE_MULTIPLIER;
    } 
    return 0;
};

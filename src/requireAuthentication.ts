import {
  GetServerSidePropsContext,
} from "next";
import { parseCookies } from "nookies";
import verifyRequest from "./verify-request/verify-request";

// Overwrite ServerResponse to allow `shopOrigin`
interface GetServerSideShopifyPropsContext extends GetServerSidePropsContext {
  shopOrigin?: string;
}


export type GetServerSideProps<
  P extends { [key: string]: any } = { [key: string]: any }
> = (context: GetServerSideShopifyPropsContext) => Promise<{ props: P }>;

const authenticateShopifyPage = async (
  getServerSidePropsInner: GetServerSideProps = async () => ({ props: {} })
) => {
  const getServerSideProps: GetServerSideProps = async (ctx) => {
    const pathname = new URL(ctx.resolvedUrl).pathname;

    const authRoute = "/api/shopify/auth";
    const fallbackRoute = "/login";
    const verifyTokenUrl = `${process.env.HOST}/api/shopify/verify-token`;
    const cookies = parseCookies(ctx);
    const shopOrigin = ctx.query.shop ?? cookies.shopOrigin;

    if (pathname !== fallbackRoute) {
      await verifyRequest({
        query: ctx.query,
        cookies,
        res: ctx.res,
        options: { authRoute, fallbackRoute, verifyTokenUrl },
      });
    }

    ctx.shopOrigin = shopOrigin as string;

    const result = await getServerSidePropsInner(ctx);

    return {
      props: {
        shopOrigin,
        ...result.props,
      },
    };
  };
  return getServerSideProps;
};

export default authenticateShopifyPage;

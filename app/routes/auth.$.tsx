import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { handleAuth } from "~/lib/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  return handleAuth(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return handleAuth(request);
}
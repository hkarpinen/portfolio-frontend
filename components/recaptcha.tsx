import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

export function RecaptchaScript({ strategy = "lazyOnload" }: { strategy?: "lazyOnload" | "afterInteractive" }) {
  return <Script src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`} strategy={strategy} />;
}

export function useRecaptcha() {
  return async function execute(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const gr = (window as { grecaptcha?: Grecaptcha }).grecaptcha;
      if (!gr) {
        reject(new Error("reCAPTCHA not loaded"));
        return;
      }
      gr.ready(() => {
        gr.execute(SITE_KEY, { action }).then(resolve).catch(reject);
      });
    });
  };
}

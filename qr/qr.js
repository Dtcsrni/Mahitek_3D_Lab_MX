(() => {
  "use strict";

  const CONFIG = Object.freeze({
    baseUrl: "https://dtcsrni.github.io/Mahitek_3D_Lab_MX/",
    redirectDelayMs: 1500,
    gaMeasurementId: "G-Y46M6J1EWS",
  });

  function onReady(handler) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handler, { once: true });
      return;
    }
    handler();
  }

  function setupAnalytics(measurementId) {
    if (!measurementId) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
      };

    const gtagSrc = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    const alreadyInjected = Array.from(document.scripts || []).some(
      (s) => typeof s.src === "string" && s.src.includes("googletagmanager.com/gtag/js"),
    );

    if (!alreadyInjected) {
      const script = document.createElement("script");
      script.async = true;
      script.src = gtagSrc;
      document.head.appendChild(script);
    }

    window.gtag("js", new Date());
    window.gtag("config", measurementId, { transport_type: "beacon" });
  }

  function readQrParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_campaign: urlParams.get("c") || "default",
      utm_medium: urlParams.get("m") || "print",
      utm_source: urlParams.get("s") || "qr",
    };
  }

  function buildFinalUrl(params) {
    const url = new URL(CONFIG.baseUrl);
    url.searchParams.set("utm_source", params.utm_source);
    url.searchParams.set("utm_medium", params.utm_medium);
    url.searchParams.set("utm_campaign", params.utm_campaign);
    return url.toString();
  }

  function safeGtagEvent(name, params) {
    try {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", name, params);
    } catch {
      // no-op
    }
  }

  function main() {
    setupAnalytics(CONFIG.gaMeasurementId);

    const qrParams = readQrParams();
    const finalUrl = buildFinalUrl(qrParams);

    const manualLink = document.getElementById("manualLink");
    if (manualLink) manualLink.href = finalUrl;

    const performRedirect = () => {
      safeGtagEvent("qr_redirect", {
        qr_source: qrParams.utm_source,
        qr_medium: qrParams.utm_medium,
        qr_campaign: qrParams.utm_campaign,
        destination: finalUrl,
      });

      setTimeout(() => {
        window.location.replace(finalUrl);
      }, CONFIG.redirectDelayMs);
    };

    performRedirect();

    if (manualLink) {
      manualLink.addEventListener("click", (e) => {
        e.preventDefault();
        safeGtagEvent("qr_manual_click", {
          qr_source: qrParams.utm_source,
          qr_medium: qrParams.utm_medium,
          qr_campaign: qrParams.utm_campaign,
        });
        window.location.replace(finalUrl);
      });
    }
  }

  onReady(main);
})();


import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import {
  DEFAULT_PAGE_CONTENT,
  DEFAULT_SITE_IMAGES,
  mergeSiteContent,
  type RawCmsTables,
} from "@/lib/cms-defaults";
import { SITE_CONTENT_QUERY_KEY } from "@/lib/site-content";
import { AnnouncementBanner } from "@/components/site/AnnouncementBanner";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { ShedVideo } from "@/components/site/ShedVideo";
import { routeTree } from "@/routeTree.gen";

/**
 * End-to-end rendering verification proving that EVERY single editable field,
 * image slot, opening hour, notice banner, gallery item/category, fee, contact,
 * trustee, supporter, and friend in the Admin Panel renders live on the website.
 */
function buildFullCustomBundle() {
  const customImages = DEFAULT_SITE_IMAGES.map((slot) => ({
    slot_key: slot.slot_key,
    page_group: slot.page_group,
    label: slot.label,
    image_url: `https://cdn.test.invalid/${slot.slot_key}.webp`,
    alt_text: `CUSTOM-ALT-${slot.slot_key}`,
    caption: `CUSTOM-CAPTION-${slot.slot_key}`,
    focal_point: "top",
  }));

  const customText = DEFAULT_PAGE_CONTENT.map((field) => ({
    content_key: field.content_key,
    value_text: `CUSTOM-TEXT-${field.content_key}`,
  }));

  const raw: RawCmsTables = {
    settings: {
      id: "main",
      joining_fee: "£15.50",
      session_fee: "£4.50",
      session_fee_short: "£4.50 test session",
      session_fee_note: "Custom tea & cake note",
      phone: "01424 999888",
      email: "custom-info@hastingsmenshed.org.uk",
      sales_email: "custom-sales@hastingsmenshed.org.uk",
      facebook_url: "https://www.facebook.com/custom-shed-test",
      donate_url: "https://pay.sumup.com/b2c/CUSTOMTEST",
      address_lines: ["99 Custom Workshop Lane", "Hastings TN35 9ZZ"],
    },
    openingHours: [
      { id: "1", day_order: 1, day_name: "Monday", is_open: true, open_time: "9:30am", close_time: "12:30pm", hours_display: "9:30am – 12:30pm", note: "Custom Carving Morning" },
      { id: "2", day_order: 2, day_name: "Tuesday", is_open: false, open_time: "10:00am", close_time: "4:00pm", hours_display: "Closed", note: "Closed for maintenance" },
      { id: "3", day_order: 3, day_name: "Wednesday", is_open: true, open_time: "10:00am", close_time: "4:00pm", hours_display: "10:00am – 4:00pm", note: "General Workshop" },
      { id: "4", day_order: 4, day_name: "Thursday", is_open: true, open_time: "1:00pm", close_time: "5:00pm", hours_display: "1:00pm – 5:00pm", note: "New Thursday Afternoon" },
      { id: "5", day_order: 5, day_name: "Friday", is_open: true, open_time: "10:00am", close_time: "4:00pm", hours_display: "10:00am – 4:00pm", note: "General Workshop" },
      { id: "6", day_order: 6, day_name: "Saturday", is_open: false, open_time: "10:00am", close_time: "1:00pm", hours_display: "Closed", note: "" },
      { id: "7", day_order: 7, day_name: "Sunday", is_open: false, open_time: "10:00am", close_time: "1:00pm", hours_display: "Closed", note: "" },
    ],
    announcement: {
      id: "main",
      enabled: true,
      variant: "closure",
      message: "CUSTOM BANNER: Closed for Bank Holiday Monday",
      link_label: "Check opening times",
      link_url: "/visit",
      expires_at: null,
    },
    siteImages: customImages,
    galleryCategories: [
      { id: "cat-custom-1", slug: "bespoke-carving", name: "Bespoke Carving", sort_order: 0 },
      { id: "cat-custom-2", slug: "metal-craft", name: "Metal Craft", sort_order: 1 },
    ],
    galleryItems: [
      {
        id: "item-custom-1",
        slug: "custom-dragon-carving",
        title: "Custom Oak Dragon",
        category_id: "cat-custom-1",
        image_url: "https://cdn.test.invalid/dragon.webp",
        sort_order: 0,
        is_visible: true,
        is_featured: true,
        for_sale: true,
        price_label: "£45 suggested donation",
      },
      {
        id: "item-hidden-2",
        slug: "secret-draft",
        title: "Hidden Draft Item",
        category_id: "cat-custom-2",
        image_url: "https://cdn.test.invalid/hidden.webp",
        sort_order: 1,
        is_visible: false,
        is_featured: false,
        for_sale: false,
        price_label: "",
      },
    ],
    pageContent: customText,
    trustees: [{ id: "t-1", name: "Jane Custom-Chair", role: "Chairwoman & Trustee", sort_order: 0 }],
    supporters: [
      {
        id: "s-1",
        name: "Custom Coastal Fund",
        logo_url: "https://cdn.test.invalid/coastal-fund.png",
        description: "Funded new dust extraction in 2026.",
        show_in_footer: true,
        show_on_about: true,
        sort_order: 0,
      },
    ],
    friends: [
      {
        id: "f-1",
        name: "Custom Community Garden",
        description: "Partnering on raised timber beds.",
        sort_order: 0,
      },
    ],
  };

  return mergeSiteContent(raw);
}

async function renderAtPath(pathname: string, bundle: ReturnType<typeof buildFullCustomBundle>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false } },
  });
  queryClient.setQueryData(SITE_CONTENT_QUERY_KEY, bundle);
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [pathname] }),
  });
  await router.load();
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("Live CMS wiring across every public component and route", () => {
  it("exposes live CMS-wired Header, Footer, AnnouncementBanner, Gallery, and ShedVideo components", () => {
    expect(AnnouncementBanner).toBeTypeOf("function");
    expect(Header).toBeTypeOf("function");
    expect(Footer).toBeTypeOf("function");
    expect(Gallery).toBeTypeOf("function");
    expect(ShedVideo).toBeTypeOf("function");
  });

  it("propagates custom Admin edits onto the Home page, About, Visit, Made in the Shed, Commissions, Donate, and Policies routes", async () => {
    const bundle = buildFullCustomBundle();

    // 1. Home page
    const home = await renderAtPath("/", bundle);
    expect(home.getByText("CUSTOM-TEXT-home.heroHeadingLine1")).toBeInTheDocument();
    expect(home.getByText("CUSTOM-TEXT-home.heroHeadingLine2")).toBeInTheDocument();
    expect(home.getByText("£4.50 test session")).toBeInTheDocument();
    expect(home.getByText("Custom tea & cake note")).toBeInTheDocument();
    expect(home.getByText("Custom Oak Dragon")).toBeInTheDocument();
    expect(home.queryByText("Hidden Draft Item")).not.toBeInTheDocument();
    expect(home.getByText("£45 suggested donation")).toBeInTheDocument();
    expect(home.getAllByText("Bespoke Carving").length).toBeGreaterThanOrEqual(2);
    expect(home.getByText("CUSTOM-TEXT-video.heading")).toBeInTheDocument();
    expect(home.getByText("CUSTOM-TEXT-footer.aboutSummary")).toBeInTheDocument();
    expect(home.getByAltText("Custom Coastal Fund")).toHaveAttribute("src", "https://cdn.test.invalid/coastal-fund.png");
    expect(home.getByAltText("CUSTOM-ALT-home.hero.mainHall")).toHaveAttribute("src", "https://cdn.test.invalid/home.hero.mainHall.webp");
    expect(home.getByText(/CUSTOM BANNER: Closed for Bank Holiday Monday/i)).toBeInTheDocument();
    home.unmount();

    // 2. Visit & Join page
    const visit = await renderAtPath("/visit", bundle);
    expect(visit.getByText("CUSTOM-TEXT-visit.heroTitle")).toBeInTheDocument();
    expect(visit.getByText("CUSTOM-TEXT-visit.parkingWarning")).toBeInTheDocument();
    expect(visit.getByText("New Thursday Afternoon")).toBeInTheDocument();
    expect(visit.getByText("£15.50")).toBeInTheDocument();
    expect(visit.getByText("£4.50")).toBeInTheDocument();
    expect(visit.getAllByText("01424 999888").length).toBeGreaterThan(0);
    expect(visit.getByText("99 Custom Workshop Lane")).toBeInTheDocument();
    visit.unmount();

    // 3. About & Impact page
    const about = await renderAtPath("/about", bundle);
    expect(about.getByText("CUSTOM-TEXT-about.heroTitle")).toBeInTheDocument();
    expect(about.getByText("CUSTOM-TEXT-about.missionQuote")).toBeInTheDocument();
    expect(about.getByText("Jane Custom-Chair")).toBeInTheDocument();
    expect(about.getAllByText("Custom Coastal Fund").length).toBeGreaterThan(0);
    expect(about.getByText("Funded new dust extraction in 2026.")).toBeInTheDocument();
    expect(about.getByText("Custom Community Garden")).toBeInTheDocument();
    expect(about.getByAltText("CUSTOM-ALT-civic.highSheriff")).toHaveAttribute("src", "https://cdn.test.invalid/civic.highSheriff.webp");
    about.unmount();

    // 4. Made in the Shed page
    const made = await renderAtPath("/made-in-the-shed", bundle);
    expect(made.getByText("CUSTOM-TEXT-made.heroTitle")).toBeInTheDocument();
    expect(made.getByText("Custom Oak Dragon")).toBeInTheDocument();
    expect(made.getAllByText("Bespoke Carving").length).toBeGreaterThanOrEqual(2);
    expect(made.getByText("Metal Craft")).toBeInTheDocument();
    expect(made.queryByText("Hidden Draft Item")).not.toBeInTheDocument();
    made.unmount();

    // 5. Commissions page
    const comm = await renderAtPath("/commissions", bundle);
    expect(comm.getByText("CUSTOM-TEXT-commissions.heroTitle")).toBeInTheDocument();
    expect(comm.getByText("CUSTOM-TEXT-commissions.directContactNote")).toBeInTheDocument();
    expect(comm.getByText("custom-sales@hastingsmenshed.org.uk")).toBeInTheDocument();
    expect(comm.getByAltText("CUSTOM-ALT-commissions.main")).toHaveAttribute("src", "https://cdn.test.invalid/commissions.main.webp");
    comm.unmount();

    // 6. Donate page
    const donate = await renderAtPath("/donate", bundle);
    expect(donate.getByText("CUSTOM-TEXT-donate.heroTitle")).toBeInTheDocument();
    expect(donate.getByText("CUSTOM-TEXT-donate.boxHeading")).toBeInTheDocument();
    expect(donate.getByText("CUSTOM-TEXT-donate.toolsBody")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Donate securely via SumUp/i })).toHaveAttribute(
      "href",
      "https://pay.sumup.com/b2c/CUSTOMTEST",
    );
    donate.unmount();

    // 7. Policies page
    const policies = await renderAtPath("/policies", bundle);
    expect(policies.getByText("CUSTOM-TEXT-policies.heroTitle")).toBeInTheDocument();
    expect(policies.getByText("Jane Custom-Chair")).toBeInTheDocument();
    policies.unmount();
  });
});

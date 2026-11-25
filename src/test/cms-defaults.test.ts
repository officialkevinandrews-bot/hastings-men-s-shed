import { describe, expect, it } from "vitest";
import {
  buildDefaultSiteContent,
  focalPointClass,
  formatOpeningSummaryLine,
  mergeSiteContent,
  normalizePhoneHref,
  slugify,
} from "@/lib/cms-defaults";

describe("CMS defaults and safe merging", () => {
  it("provides complete defaults for all image slots, text blocks, hours, and gallery items", () => {
    const defaults = buildDefaultSiteContent();
    expect(defaults.openingHours).toHaveLength(7);
    expect(defaults.galleryCategories.length).toBeGreaterThanOrEqual(3);
    expect(defaults.galleryItems.length).toBeGreaterThanOrEqual(30);
    expect(defaults.images["home.hero.mainHall"]?.image_url).toBeTruthy();
    expect(defaults.images["site.logo"]?.image_url).toBeTruthy();
    expect(defaults.pageContent["home.heroHeadingLine1"]).toBe("Make things.");
    expect(defaults.trustees.length).toBeGreaterThanOrEqual(4);
    expect(defaults.supporters.filter((s) => s.show_in_footer).length).toBe(8);
  });

  it("merges partial DB overrides while keeping built-in fallbacks intact", () => {
    const merged = mergeSiteContent({
      settings: {
        id: "main",
        joining_fee: "£12.00",
        session_fee: "£3.50",
        session_fee_short: "£3.50 a session",
        session_fee_note: "Tea & biscuits included",
        phone: "01424 111222",
        email: "hello@hastingsmenshed.org.uk",
        sales_email: "sales@hastingsmenshed.org.uk",
        facebook_url: "https://facebook.com/shed",
        donate_url: "https://pay.sumup.com/b2c/QMPIUPBZ",
        address_lines: ["20 Manhattan Gardens", "Hastings TN35 5DQ"],
      },
      openingHours: [
        {
          id: "1",
          day_order: 4,
          day_name: "Thursday",
          is_open: true,
          open_time: "10:00am",
          close_time: "2:00pm",
          hours_display: "10:00am – 2:00pm",
          note: "New Thursday Drop-in",
        },
      ],
      announcement: {
        id: "main",
        enabled: true,
        variant: "closure",
        message: "Closed Bank Holiday Monday",
        link_label: "Opening times",
        link_url: "/visit",
        expires_at: null,
      },
      siteImages: [
        {
          slot_key: "home.hero.mainHall",
          page_group: "Home Page",
          label: "Hero Top Main Photo",
          image_url: "https://cdn.example/new-hall.jpg",
          alt_text: "Updated hall photo",
          caption: "",
          focal_point: "top",
        },
      ],
      galleryCategories: [
        { id: "cat-1", slug: "woodcarving", name: "Woodcarving", sort_order: 0 },
      ],
      galleryItems: [
        {
          id: "item-1",
          slug: "owl-1",
          title: "Carved Barn Owl",
          category_id: "cat-1",
          image_url: "https://cdn.example/owl.jpg",
          sort_order: 0,
          is_visible: true,
          is_featured: true,
          for_sale: true,
          price_label: "£25 suggested donation",
        },
      ],
      pageContent: [{ content_key: "home.heroHeadingLine1", value_text: "Craft together." }],
      trustees: [],
      supporters: [],
      friends: [],
    });

    expect(merged.settings.joining_fee).toBe("£12.00");
    expect(merged.settings.phoneHref).toBe("tel:+441424111222");
    expect(merged.openingHours[3]?.is_open).toBe(true);
    expect(merged.openingHours[3]?.note).toBe("New Thursday Drop-in");
    expect(merged.openingHours[0]?.day_name).toBe("Monday");
    expect(merged.announcement.enabled).toBe(true);
    expect(merged.images["home.hero.mainHall"]?.is_custom).toBe(true);
    expect(merged.images["home.hero.mainHall"]?.focal_point).toBe("top");
    expect(merged.images["home.hero.buildingExterior"]?.is_custom).toBe(false);
    expect(merged.galleryFromDb).toBe(true);
    expect(merged.galleryItems[0]?.category_name).toBe("Woodcarving");
    expect(merged.pageContent["home.heroHeadingLine1"]).toBe("Craft together.");
    expect(merged.pageContent["home.heroHeadingLine2"]).toBe("Make friends.");
  });

  it("formats helpers cleanly", () => {
    expect(normalizePhoneHref("01424 444246")).toBe("tel:+441424444246");
    expect(focalPointClass("right")).toBe("object-right");
    expect(slugify("Wildlife & Gardens!")).toBe("wildlife-gardens");
    const summary = formatOpeningSummaryLine(buildDefaultSiteContent().openingHours);
    expect(summary).toContain("Mon 10am–1pm");
    expect(summary).toContain("2nd & 4th Sat 10am–1pm");
  });
});

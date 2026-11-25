import { useSiteContent } from "@/lib/site-content";

export function ShedVideo() {
  const { images, pageContent } = useSiteContent();
  const poster = images["video.poster"]?.image_url || "/videos/shed-poster.jpg";

  return (
    <section className="bg-primary py-20 text-primary-foreground" id="inside">
      <div className="mx-auto max-w-5xl px-4">
        <p className="font-bold uppercase tracking-widest text-accent">
          Inside our charity &amp; workshops • Relaxing slideshow
        </p>
        <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">{pageContent["video.heading"]}</h2>
        <p className="mt-4 max-w-2xl text-primary-foreground/85">{pageContent["video.description"]}</p>
        <div className="mt-8 overflow-hidden rounded-2xl border-4 border-accent shadow-soft">
          <video
            controls
            loop
            preload="metadata"
            poster={poster}
            className="aspect-video w-full bg-foreground"
            playsInline
          >
            <source src="/videos/mens-shed-slideshow.mp4" type="video/mp4" />
            Your browser can't play this video.
          </video>
        </div>
      </div>
    </section>
  );
}

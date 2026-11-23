import video from "@/assets/shed-video.mp4.asset.json";
import poster from "@/assets/shed-poster.jpg.asset.json";

export function ShedVideo() {
  return (
    <section className="bg-primary py-20 text-primary-foreground" id="inside">
      <div className="mx-auto max-w-5xl px-4">
        <p className="font-bold uppercase tracking-widest text-accent">Three minutes inside</p>
        <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Take a look inside the Shed</h2>
        <p className="mt-4 max-w-2xl text-primary-foreground/85">The same slideshow that plays in our reception: the workshops, the people and the things we make together. Press play and come and have a nose around.</p>
        <div className="mt-8 overflow-hidden rounded-2xl border-4 border-accent shadow-soft">
          <video controls preload="metadata" poster={poster.url} className="aspect-video w-full bg-foreground" playsInline>
            <source src={video.url} type="video/mp4" />
            Your browser can't play this video.
          </video>
        </div>
      </div>
    </section>
  );
}

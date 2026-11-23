export function ShedVideo() {
  return (
    <section className="bg-primary py-20 text-primary-foreground" id="inside">
      <div className="mx-auto max-w-5xl px-4">
        <p className="font-bold uppercase tracking-widest text-accent">Inside our charity &amp; workshops • Relaxing coastal slideshow</p>
        <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Take a look inside the Shed</h2>
        <p className="mt-4 max-w-2xl text-primary-foreground/85">
          The same relaxing slideshow that plays on a loop in our waiting area: our charitable mission, the Godfrey Bevan Workshops, our members, woodcarving and joinery projects, community restorations, wildlife builds, and our supporters — accompanied by gentle Hastings sea waves.
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl border-4 border-accent shadow-soft">
          <video
            controls
            loop
            preload="metadata"
            poster="/videos/shed-poster.jpg"
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

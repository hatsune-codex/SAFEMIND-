(() => {
    const settings = {
        sparkColor: "#ffffff",
        sparkSize: 10,
        sparkRadius: 15,
        sparkCount: 8,
        duration: 400,
        extraScale: 1
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const sparks = [];

    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = [
        "position: fixed",
        "inset: 0",
        "width: 100vw",
        "height: 100vh",
        "z-index: 9999",
        "pointer-events: none"
    ].join(";");
    document.body.appendChild(canvas);

    const resizeCanvas = () => {
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * pixelRatio;
        canvas.height = window.innerHeight * pixelRatio;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (timestamp) => {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let index = sparks.length - 1; index >= 0; index -= 1) {
            const spark = sparks[index];
            const progress = (timestamp - spark.startTime) / settings.duration;

            if (progress >= 1) {
                sparks.splice(index, 1);
                continue;
            }

            const eased = progress * (2 - progress);
            const distance = eased * settings.sparkRadius * settings.extraScale;
            const lineLength = settings.sparkSize * (1 - eased);
            const startX = spark.x + distance * Math.cos(spark.angle);
            const startY = spark.y + distance * Math.sin(spark.angle);
            const endX = spark.x + (distance + lineLength) * Math.cos(spark.angle);
            const endY = spark.y + (distance + lineLength) * Math.sin(spark.angle);

            context.strokeStyle = settings.sparkColor;
            context.globalAlpha = 1 - progress;
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(startX, startY);
            context.lineTo(endX, endY);
            context.stroke();
        }

        context.globalAlpha = 1;
        window.requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas, { passive: true });
    document.addEventListener("click", (event) => {
        const now = performance.now();

        for (let index = 0; index < settings.sparkCount; index += 1) {
            sparks.push({
                x: event.clientX,
                y: event.clientY,
                angle: (2 * Math.PI * index) / settings.sparkCount,
                startTime: now
            });
        }
    });

    resizeCanvas();
    window.requestAnimationFrame(draw);
})();

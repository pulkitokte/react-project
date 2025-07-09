import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

export default function CarouselBanner() {
  return (
    <div className="w-full mt-[150px] px-4 md:px-10">
      <div className="rounded-md overflow-hidden shadow-md">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={3000}
          showArrows={true}
          stopOnHover={false}
        >
          <div>
            <img
              src="https://www.india.com/wp-content/uploads/2023/12/Amazon-Deals-6.jpg"
              alt="Slide 1"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
          </div>
          <div>
            <img
              src="https://images.hindustantimes.com/img/2024/07/19/1600x900/story_-_general_1721375545192_1721375559292.jpg"
              alt="Slide 2"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
          </div>
          <div>
            <img
              src="https://images.moneycontrol.com/static-mcnews/2022/01/Amazon-Great-Republic-Day-Sale.jpg"
              alt="Slide 3"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
          </div>
        </Carousel>
      </div>
    </div>
  );
}

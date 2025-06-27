import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

export default function CarouselBanner() {
    return (
      <div style={{ maxWidth: "100%", margin: "10px"}}>
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={3000}
        >
          <div>
            <img
              src="https://www.india.com/wp-content/uploads/2023/12/Amazon-Deals-6.jpg"
              alt="Slide 1"
            />
          </div>
          <div>
            <img
              src="https://images.hindustantimes.com/img/2024/07/19/1600x900/story_-_general_1721375545192_1721375559292.jpg"
              alt="Slide 2"
            />
          </div>
          <div>
            <img
              src="https://images.moneycontrol.com/static-mcnews/2022/01/Amazon-Great-Republic-Day-Sale.jpg"
              alt="Slide 3"
            />
          </div>
        </Carousel>
      </div>
    );
}
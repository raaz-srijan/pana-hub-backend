import Author from "./components/Author";
import Book from "./components/Book";
import Bookstore from "./components/Bookstore";
import Categories from "./components/Categories";
import Featured from "./components/Featured";
import Hero from "./components/Hero";
import Newsletter from "./components/Newsletter";
import Quote from "./components/Quote";

const HomePage = () => {
  return (
    <>
      <Hero />
      <Featured />
      <Book />
      <Categories />
      <Bookstore />
      <Quote />
      <Newsletter />
      <Author />
    </>
  );
};

export default HomePage;
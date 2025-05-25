import { useEffect } from "react";
import axios from "axios";

export default function Home() {
  // const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get("/users/me");
        console.log("Fetched products:", res.data);
       
        // setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Product List</h2>
      {/* <ul>
        {products.map((product: any) => (
          <li key={product.id}>
            {product.name} - {product.price}
          </li>
        ))}
      </ul> */}
    </div>
  );
}

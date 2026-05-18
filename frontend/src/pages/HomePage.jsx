import { useState } from "react";
import PostForm from "../components/PostForm";
import PostList from "../components/PostList";

function HomePage() {
  const [refresh, setRefresh] = useState(0);

  const handlePostCreated = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <div className="container">
      <h1>Reddit Clone</h1>
      <PostForm onPostCreated={handlePostCreated} />
      <PostList refresh={refresh} />
    </div>
  );
}

export default HomePage;

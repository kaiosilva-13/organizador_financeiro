import HeroBanner from "./components/login/HeroBanner";
import LoginCard from "./components/login/LoginCard";

function App() {
  return (
    <div className="flex min-h-svh w-full flex-col lg:flex-row">
      <HeroBanner />
      <LoginCard />
    </div>
  );
}

export default App;

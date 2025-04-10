
import { Link } from "react-router-dom";

const LogoLink = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <span className="font-bold text-xl text-institute-600">IMS</span>
    </Link>
  );
};

export default LogoLink;

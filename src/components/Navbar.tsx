import LogoIcon from "./LogoIcon";
import SudoIcon from "./SudoIcon";
import { Link } from "react-router-dom";
import TwitterIcon from "./TwitterIcon";

// import GithubIcon from './GithubIcon';

export default function Navbar() {
  return (
    <header className="nav-bar">
      <div className="nav-content">
        <Link to="/">
          <div className="logo-box">
            <LogoIcon />
            <div>Sudoswap analytics</div>
          </div>
        </Link>
        <div className="external-links">
          <a
            href="https://www.notion.so/charliecf/About-Sudoswap-analytics-66a74430c4744418a36d7383a9f1bc4f"
            target="_blank"
          >
            <p>About</p>
          </a>
          <a href="https://sudoswap.xyz/" target="_blank">
            <p>Sudoswap</p>
          </a>
          <a href="https://twitter.com/sudoswapinfo" target="_blank">
            <p>Twitter</p>
          </a>
          {/* <a href=""><GithubIcon/></a> */}
        </div>
      </div>
    </header>
  );
}

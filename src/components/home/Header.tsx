import Link from "next/link";

export function Header() {
  const linkList = [
    { label: "Github", href: "https://github.com/FuyuMikanLab" },
    // { label: "Bilibili", href: "/" },
  ];
  // const toolList = [{ label: "Language", href: "/news" }];

  return (
    <></>
    // <div className="flex justify-between items-center p-4 header header__texture">
    //   <h1 className="header__title">FuyumikanLab</h1>
    //   <div className="flex items-center gap-16">
    //     <nav className="flex items-center gap-4">
    //       {linkList.map((link) => (
    //         <Link className="link" key={link.href} href={link.href}>
    //           {link.label}
    //         </Link>
    //       ))}
    //     </nav>
    //   </div>
    // </div>
  );
}

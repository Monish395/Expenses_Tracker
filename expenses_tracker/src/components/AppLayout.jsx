import NavSidebar from "./NavSidebar";

/**
 * Shared page shell. Every authenticated page should render its content
 * inside this instead of hand-rolling its own `fixed aside + ml-64 main`
 * wrapper (that pattern was duplicated across 11 pages and was the root
 * cause of the mobile layout breakage).
 *
 * The sidebar is a fixed-position icon-rail (see NavSidebar.jsx) that's
 * 4rem (w-16) wide collapsed, regardless of breakpoint. We reserve that
 * 4rem with `pl-16` on the content wrapper at ALL sizes — when the
 * sidebar expands it overlays the page (with a backdrop) rather than
 * pushing content, so we never need to juggle two different margins.
 *
 * Usage:
 *   <AppLayout bgClassName="bg-indigo-50">
 *     <h2>Page title</h2>
 *     ...page content...
 *   </AppLayout>
 *
 * `bgClassName` lets pages keep their existing background treatment
 * (gradients, solid colors, etc.) without re-implementing the wrapper.
 * `mainClassName` is an escape hatch for per-page padding/width tweaks.
 */
function AppLayout({ children, bgClassName = "bg-white", mainClassName = "" }) {
  return (
    <div className={`flex min-h-screen w-full ${bgClassName}`}>
      <NavSidebar />
      <main
        className={`flex-1 pl-16 min-h-screen overflow-y-auto ${mainClassName}`}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default AppLayout;

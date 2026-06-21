import NavSidebar from "./NavSidebar";

/**
 * Shared page shell. Every authenticated page should render its content
 * inside this instead of hand-rolling its own `fixed aside + ml-64 main`
 * wrapper (that pattern was duplicated across 11 pages and was the root
 * cause of the mobile layout breakage).
 *
 * Sidebar behavior (see NavSidebar.jsx) is breakpoint-dependent, and this
 * wrapper's padding has to track it exactly or content either overlaps
 * the sidebar or leaves a dead gap:
 *   - Below lg (mobile, or a desktop window resized narrow for
 *     side-by-side use): the sidebar is a collapsed w-16 icon rail by
 *     default that expands on tap and OVERLAYS the page with a backdrop.
 *     We only ever need to reserve the collapsed width here — `pl-16`.
 *   - At lg+ (full-width desktop): the sidebar is always expanded
 *     (w-64) and PUSHES content instead of overlaying it — there's no
 *     manual toggle at this size since there's room for it. We reserve
 *     the full `pl-64` here.
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
        className={`flex-1 pl-16 lg:pl-64 min-h-screen overflow-y-auto transition-[padding] duration-200 ${mainClassName}`}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default AppLayout;

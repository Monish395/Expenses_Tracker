function GroupMembers({ group }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-sky-700 mb-3">Group Members</h2>
      <ul className="space-y-2">
        {group.members?.length > 0 ? (
          group.members.map((m, i) => (
            <li
              key={i}
              className="bg-sky-50 border border-sky-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <span className="block font-medium">
                {m.username || "Unknown"}
              </span>
              {m.role && (
                <span className="ml-auto inline-block bg-sky-100 text-sky-500 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                </span>
              )}
            </li>
          ))
        ) : (
          <li className="text-slate-400">No members added yet</li>
        )}
      </ul>
    </div>
  );
}

export default GroupMembers;

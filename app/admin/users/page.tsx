export default function AdminUsersPage() {
  return (
    <section className="grid gap-4">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold">All Users</h1>
        <p className="text-sm text-muted-foreground">
          Browse and manage all users across admins, partners, and referrals.
        </p>
      </header>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-card">
          <h2 className="font-medium">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-4 py-2">Admin User</td>
                <td className="px-4 py-2">admin@123.com</td>
                <td className="px-4 py-2">Admin</td>
                <td className="px-4 py-2">Active</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-2">partner A</td>
                <td className="px-4 py-2">inf@123.com</td>
                <td className="px-4 py-2">partner</td>
                <td className="px-4 py-2">Active</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-4 py-2">Referred User</td>
                <td className="px-4 py-2">user1@example.com</td>
                <td className="px-4 py-2">Customer</td>
                <td className="px-4 py-2">Trial</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

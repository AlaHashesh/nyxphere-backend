import { useSession } from "next-auth/react";

export default function UserAvatar() {
  const { data } = useSession();

  return (
    <a
      href="#"
      className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white hover:bg-gray-800"
    >
      <img
        alt=""
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        className="size-8 rounded-full bg-gray-800"
      />
      <span aria-hidden="true">{data?.user?.email}</span>
    </a>
  );
}
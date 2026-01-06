import { getAvatar } from "../../../utils/helper";

const UserAvatar = ({
  first,
  last,
  className,
}: {
  first?: string;
  last?: string;
  className?: string;
}) => {
  const { initials, colorTheme } = getAvatar(first, last);

  return (
    <div
      title={`${first ?? ""} ${last ?? ""}`}
      className={`h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold ${colorTheme.bg} ${colorTheme.text} ${className}`}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;

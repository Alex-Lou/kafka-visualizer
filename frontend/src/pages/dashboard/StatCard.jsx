import { DASHBOARD } from '@constants/styles/dashboard';

export function StatCard({ label, value, icon: Icon, iconBg, onClick }) {
  return (
    <div
      className={`${DASHBOARD.STAT_CARD} cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-xl`}
      onClick={onClick}
      title={`Go to ${label}`}
    >
      <div className={`${DASHBOARD.STAT_CARD_ICON_WRAPPER} ${iconBg}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className={DASHBOARD.STAT_CARD_LABEL}>{label}</p>
      <p className={`${DASHBOARD.STAT_CARD_VALUE} transition-all duration-300`}>{value}</p>
    </div>
  );
}

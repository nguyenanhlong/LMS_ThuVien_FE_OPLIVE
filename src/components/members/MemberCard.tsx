'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Member {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  status?: string;
  joinDate?: string;
}

interface MemberCardProps {
  member: Member;
  onSelect: (member: Member) => void;
}

export default function MemberCard({ member, onSelect }: MemberCardProps) {
  const st = member.status?.toLowerCase();
  const statusVariant = st === 'active' ? 'success' : st === 'inactive' ? 'danger' : 'muted';

  return (
    <Card hover className="member-card" onClick={() => onSelect(member)}>
      <div className="member-card-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <h4>{member.name}</h4>
      </div>
      <p className="member-card-email">{member.email}</p>
      <p className="member-card-phone">{member.phone || '—'}</p>
      <div className="member-card-footer">
        <Badge variant={statusVariant}>{st === 'active' ? 'Hoạt động' : st === 'inactive' ? 'Ngưng' : member.status}</Badge>
        {member.joinDate && <span className="member-card-date">Tham gia: {member.joinDate}</span>}
      </div>
    </Card>
  );
}

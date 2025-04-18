import React from 'react';
import { Card } from 'react-bootstrap';

export interface UserDetails {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface Member {
    PK: string;
    SK: string;
    GSI1PK?: string;
    GSI1SK?: string;
    userId: string;
    role: string;
    joinDate: string;
    organizationName: string;
    userDetails: UserDetails;
}

interface MemberCardProps {
    member: Member;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isSelected, onSelect }) => {
    const memberId = member.PK.split('#')[1] || member.userId || member.userDetails.id;
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const { firstName, lastName } = member.userDetails;
    const displayName = `${firstName} ${lastName}`;
    const isAdmin = member.role === 'ADMIN';

    return (
        <Card
            className={`member-card ${isSelected ? 'selected' : ''} ${isAdmin ? 'admin-card' : 'regular-card'}`}
            onClick={() => onSelect(memberId)}
            style={{
                width: '300px',
                height: '200px',
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#4d5154' : '#343a40',
                borderColor: isSelected ? '#fff' : 'transparent',
                borderWidth: isSelected ? '2px' : '1px',
                transition: 'all 0.2s ease-in-out',
            }}
        >
            <div className="card-content text-white p-4 d-flex flex-column justify-content-between h-100">
                <div>
                    <h5 className="card-title">{displayName}</h5>
                </div>

                <div className="card-footer bg-transparent border-0 text-white-50">
                    <small>Member since {formatDate(member.joinDate)}</small>
                </div>
            </div>
        </Card>
    );
};

export default MemberCard;

"use client";

import React, { useMemo } from "react";
import { Users, User, Shield, Briefcase, Building2, Network } from "lucide-react";

interface OrgUser {
  id: string;
  full_name: string;
  email: string;
  employee_code: string;
  departments?: { department_name: string };
  teams?: { name: string };
  positions?: { position_name: string };
  roles?: { role_name: string };
  is_working: boolean;
}

export default function OrgChartView({ users }: { users: OrgUser[] }) {
  // Filter active working users
  const activeUsers = users.filter(u => u.is_working);

  // Build the tree
  const orgTree = useMemo(() => {
    // 1. Group by Department
    const deptMap = new Map<string, {
      name: string;
      teams: Map<string, {
        name: string;
        users: OrgUser[];
      }>;
      noTeamUsers: OrgUser[];
    }>();

    // Catch-all for CEO/BOD or people without department
    const boardOfDirectors: OrgUser[] = [];

    activeUsers.forEach(user => {
      const deptName = user.departments?.department_name;
      const teamName = user.teams?.name;

      if (!deptName) {
        boardOfDirectors.push(user);
        return;
      }

      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, { name: deptName, teams: new Map(), noTeamUsers: [] });
      }
      
      const dept = deptMap.get(deptName)!;

      if (!teamName) {
        dept.noTeamUsers.push(user);
      } else {
        if (!dept.teams.has(teamName)) {
          dept.teams.set(teamName, { name: teamName, users: [] });
        }
        dept.teams.get(teamName)!.users.push(user);
      }
    });

    return {
      boardOfDirectors,
      departments: Array.from(deptMap.values())
    };
  }, [activeUsers]);

  const UserCard = ({ user, isCEO = false }: { user: OrgUser, isCEO?: boolean }) => (
    <div className={`relative flex flex-col items-center p-3 rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md w-48 ${isCEO ? 'border-amber-300 ring-4 ring-amber-50' : 'border-slate-200 hover:border-blue-400'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-3 shadow-inner ${isCEO ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
        {user.full_name?.substring(0, 2).toUpperCase() || 'NV'}
      </div>
      <h4 className="text-sm font-bold text-slate-800 text-center leading-tight mb-1">{user.full_name}</h4>
      <div className="text-[10px] text-slate-500 font-mono mb-2">{user.employee_code}</div>
      <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isCEO ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
        {user.positions?.position_name || "Nhân viên"}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-600" />
          Sơ đồ tổ chức công ty
        </h2>
        <p className="text-sm text-slate-500 mt-1">Cấu trúc nhân sự đang làm việc tại CAMA HAUTE COUTURE</p>
      </div>

      <div className="flex flex-col items-center">
        {/* CEO / Board of Directors */}
        {orgTree.boardOfDirectors.length > 0 && (
          <div className="flex flex-col items-center mb-12 relative">
            <div className="flex justify-center gap-6 flex-wrap">
              {orgTree.boardOfDirectors.map(user => (
                <UserCard key={user.id} user={user} isCEO={true} />
              ))}
            </div>
            {/* Downward Line from CEO */}
            {orgTree.departments.length > 0 && (
              <div className="w-px h-12 bg-slate-300 mt-4"></div>
            )}
          </div>
        )}

        {/* Departments Tier */}
        {orgTree.departments.length > 0 && (
          <div className="flex flex-col items-center w-full">
            {/* Horizontal Line connecting departments */}
            <div className="relative w-full flex justify-center h-8">
              {orgTree.departments.length > 1 && (
                <div className="absolute top-0 border-t-2 border-slate-300 w-[calc(100%-min(100vw,24rem)/2)] max-w-5xl"></div>
              )}
            </div>

            <div className="flex justify-center flex-wrap gap-8 items-start w-full">
              {orgTree.departments.map((dept, i) => (
                <div key={dept.name} className="flex flex-col items-center relative min-w-[280px]">
                  {/* Line down to Department */}
                  <div className="w-px h-8 bg-slate-300 absolute -top-8"></div>
                  
                  {/* Department Header */}
                  <div className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 z-10 w-full justify-center mb-6">
                    <Building2 className="w-4 h-4" />
                    {dept.name}
                  </div>

                  {/* Department direct users */}
                  {dept.noTeamUsers.length > 0 && (
                    <div className="flex flex-col items-center gap-4 mb-6">
                      {dept.noTeamUsers.map(user => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </div>
                  )}

                  {/* Teams within Department */}
                  {Array.from(dept.teams.values()).length > 0 && (
                    <div className="flex flex-col items-center w-full mt-4">
                      {Array.from(dept.teams.values()).map(team => (
                        <div key={team.name} className="flex flex-col items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm w-full mb-6 relative">
                          <div className="absolute -top-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                            Nhóm: {team.name}
                          </div>
                          <div className="flex flex-wrap justify-center gap-4 mt-4">
                            {team.users.map(user => (
                              <UserCard key={user.id} user={user} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

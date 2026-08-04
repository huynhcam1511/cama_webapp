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
  avatar_url?: string;
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

    let director: OrgUser | null = null;
    let advisoryBoard: OrgUser[] = [];
    const boardOfDirectors: OrgUser[] = []; // Other top level

    activeUsers.forEach(user => {
      const deptName = user.departments?.department_name;
      const teamName = user.teams?.name;
      const posName = user.positions?.position_name?.toLowerCase() || "";

      // Explicitly identify the Director
      if (posName.includes("giám đốc") || user.full_name.toLowerCase().includes("nguyễn văn cao")) {
        director = user;
        return;
      }

      // Explicitly identify Advisory Board
      if (deptName?.toLowerCase().includes("tham vấn")) {
        advisoryBoard.push(user);
        return;
      }

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
      director,
      advisoryBoard,
      boardOfDirectors,
      departments: Array.from(deptMap.values())
    };
  }, [activeUsers]);

  const UserCard = ({ user, isCEO = false, isAdvisor = false }: { user: OrgUser, isCEO?: boolean, isAdvisor?: boolean }) => (
    <div className={`relative flex flex-col items-center p-4 rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg w-52 ${isCEO ? 'border-amber-400 ring-4 ring-amber-100 z-10' : isAdvisor ? 'border-purple-300 ring-2 ring-purple-50' : 'border-slate-200 hover:border-blue-400'}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold mb-3 shadow-md overflow-hidden ${isCEO ? 'bg-gradient-to-br from-amber-400 to-orange-600 ring-2 ring-white' : isAdvisor ? 'bg-gradient-to-br from-purple-400 to-indigo-500' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl">{user.full_name?.substring(0, 2).toUpperCase() || 'NV'}</span>
        )}
      </div>
      <h4 className="text-[15px] font-bold text-slate-800 text-center leading-tight mb-1">{user.full_name}</h4>
      <div className="text-[11px] text-slate-500 font-mono mb-3 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{user.employee_code}</div>
      <div className={`text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${isCEO ? 'bg-gradient-to-r from-amber-200 to-orange-200 text-amber-900' : isAdvisor ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
        {user.positions?.position_name || "Nhân viên"}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700 inline-flex items-center gap-3">
          <Network className="w-8 h-8 text-blue-600" />
          Sơ đồ Tổ chức
        </h2>
        <p className="text-slate-500 mt-2 font-medium">Cấu trúc nhân sự tinh gọn & chuyên nghiệp tại CAMA</p>
      </div>

      <div className="flex flex-col items-center relative">
        
        {/* Top Level: Director & Advisory Board */}
        <div className="flex justify-center items-start gap-16 mb-16 relative w-full max-w-4xl">
          {/* Director */}
          {orgTree.director && (
            <div className="flex flex-col items-center relative z-20">
              <UserCard user={orgTree.director} isCEO={true} />
              {/* Line down from Director */}
              <div className="w-1 bg-gradient-to-b from-amber-400 to-slate-300 h-16 mt-0 rounded-b-full"></div>
            </div>
          )}

          {/* Advisory Board (Parallel to Director) */}
          {orgTree.advisoryBoard.length > 0 && (
            <div className="flex flex-col items-center relative z-10 pt-4">
              <div className="bg-purple-600 text-white px-5 py-2 rounded-lg font-bold shadow-md shadow-purple-500/30 flex items-center gap-2 mb-6">
                <Shield className="w-4 h-4" />
                Ban Tham Vấn
              </div>
              <div className="flex gap-4">
                {orgTree.advisoryBoard.map(user => (
                  <UserCard key={user.id} user={user} isAdvisor={true} />
                ))}
              </div>
              
              {/* Connecting line to main trunk if director exists */}
              {orgTree.director && (
                <div className="absolute top-10 -left-16 w-16 h-0.5 bg-slate-300 border-t border-dashed border-slate-400"></div>
              )}
            </div>
          )}
        </div>

        {/* Other Board members without department */}
        {orgTree.boardOfDirectors.length > 0 && (
          <div className="flex flex-col items-center mb-12">
            <div className="flex justify-center gap-6 flex-wrap">
              {orgTree.boardOfDirectors.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
            <div className="w-0.5 h-12 bg-slate-300 mt-4"></div>
          </div>
        )}

        {/* Departments Tier */}
        {orgTree.departments.length > 0 && (
          <div className="flex flex-col items-center w-full relative z-0">
            {/* Horizontal Line connecting departments */}
            <div className="relative w-full flex justify-center h-8">
              {orgTree.departments.length > 1 && (
                <div className="absolute top-0 border-t-2 border-slate-300 w-[calc(100%-min(100vw,24rem)/2)] max-w-5xl rounded-t-xl"></div>
              )}
            </div>

            <div className="flex justify-center flex-wrap gap-10 items-start w-full">
              {orgTree.departments.map((dept, i) => (
                <div key={dept.name} className="flex flex-col items-center relative min-w-[300px]">
                  {/* Line down to Department */}
                  <div className="w-0.5 h-8 bg-slate-300 absolute -top-8"></div>
                  
                  {/* Department Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 z-10 w-full justify-center mb-8 border border-white/20">
                    <Building2 className="w-5 h-5" />
                    {dept.name}
                  </div>

                  {/* Department direct users */}
                  {dept.noTeamUsers.length > 0 && (
                    <div className="flex flex-col items-center gap-5 mb-8">
                      {dept.noTeamUsers.map(user => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </div>
                  )}

                  {/* Teams within Department */}
                  {Array.from(dept.teams.values()).length > 0 && (
                    <div className="flex flex-col items-center w-full mt-2 gap-6">
                      {Array.from(dept.teams.values()).map(team => (
                        <div key={team.name} className="flex flex-col items-center bg-white/60 backdrop-blur-sm border border-slate-200/60 p-5 rounded-2xl shadow-sm w-full relative pt-8">
                          <div className="absolute -top-3.5 bg-white text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border-2 border-blue-100 shadow-sm flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {team.name}
                          </div>
                          <div className="flex flex-wrap justify-center gap-5">
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

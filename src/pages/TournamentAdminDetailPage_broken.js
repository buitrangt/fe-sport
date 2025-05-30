                            <div className="flex space-x-2 mt-2 justify-end">
                              {match.status === 'PENDING' && (
                                <button className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                                  <Play className="h-3 w-3 inline mr-1" />
                                  Bắt đầu
                                </button>
                              )}
                              
                              {(match.status === 'ONGOING' || match.status === 'COMPLETED') && (
                                <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">
                                  <Edit className="h-3 w-3 inline mr-1" />
                                  Sửa tỉ số
                                </button>
                              )}
                              
                              <button className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700">
                                <Eye className="h-3 w-3 inline mr-1" />
                                Chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {match.location && (
                          <div className="mt-2 text-sm text-gray-500 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {match.location}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
              <Settings className="h-6 w-6 mr-2 text-gray-600" />
              Cài đặt giải đấu
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên giải đấu</label>
                  <input
                    type="text"
                    value={tournamentData.name || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số đội tham dự</label>
                  <input
                    type="number"
                    value={tournamentData.maxTeams || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <input
                    type="text"
                    value={getTournamentStatusLabel(tournamentData.status)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thể thức</label>
                  <input
                    type="text"
                    value={tournamentData.format || 'Knockout'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={tournamentData.description || ''}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nâng cao</h3>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </button>
                  <button 
                    onClick={() => deleteTournamentMutation.mutate()}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa giải đấu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TournamentEditForm
          tournament={tournamentData}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['tournament', id]);
            setShowEditModal(false);
            toast.success('Đã cập nhật giải đấu thành công!');
          }}
        />
      )}

      {/* Team Registration Modal */}
      <TeamRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        tournament={tournamentData}
        onSuccess={() => {
          setShowRegistrationModal(false);
          refetchTournament();
          refetchTeams();
          toast.success('Đã đăng ký đội thành công!');
        }}
      />
      
      {/* Tournament Workflow Guide */}
      {showWorkflowGuide && tournamentData && (
        <TournamentWorkflowGuide
          tournament={tournamentData}
          currentRound={currentRound}
          matches={matchesList}
          onClose={() => setShowWorkflowGuide(false)}
        />
      )}
    </div>
  );
};

export default TournamentAdminDetailPage;
export function userDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    studentId: row.student_id,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

export function buildingDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    address: row.address,
    gender: row.gender,
    floors: row.floors,
    description: row.description,
    createdAt: row.created_at,
    roomsCount: row.rooms_count ?? undefined,
  };
}

export function roomDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    buildingId: row.building_id,
    buildingCode: row.building_code,
    buildingName: row.building_name,
    code: row.code,
    name: row.name,
    floor: row.floor,
    capacity: row.capacity,
    roomType: row.room_type,
    pricePerMonth: row.price_per_month,
    status: row.status,
    description: row.description,
    createdAt: row.created_at,
    bedCount: row.bed_count ?? 0,
    occupiedBeds: row.occupied_beds ?? 0,
    availableBeds: row.available_beds ?? 0,
  };
}

export function bedDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    roomId: row.room_id,
    roomCode: row.room_code,
    buildingName: row.building_name,
    code: row.code,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function studentDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    mssv: row.mssv,
    fullName: row.full_name,
    gender: row.gender,
    dateOfBirth: row.date_of_birth,
    className: row.class_name,
    faculty: row.faculty,
    phone: row.phone,
    email: row.email,
    address: row.address,
    status: row.status,
    bedId: row.bed_id,
    bedCode: row.bed_code ?? null,
    roomId: row.room_id ?? null,
    roomCode: row.room_code ?? null,
    buildingCode: row.building_code ?? null,
    buildingName: row.building_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function applicationDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    studentId: row.student_id,
    mssv: row.mssv,
    studentName: row.student_name,
    className: row.class_name,
    preferredRoomId: row.preferred_room_id,
    preferredRoomCode: row.preferred_room_code ?? null,
    preferredBuildingName: row.preferred_building_name ?? null,
    status: row.status,
    note: row.note,
    reviewNote: row.review_note,
    assignedBedId: row.assigned_bed_id,
    assignedBedCode: row.assigned_bed_code ?? null,
    assignedRoomCode: row.assigned_room_code ?? null,
    assignedBuildingName: row.assigned_building_name ?? null,
    reviewedBy: row.reviewed_by,
    reviewerName: row.reviewer_name ?? null,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  };
}

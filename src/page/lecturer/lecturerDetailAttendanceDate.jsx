import { useState, useEffect, useContext, useCallback, memo } from "react";
import { LecturerContext } from "./lecturerDetailCoursePage";
import { doGetAttendedListOfDate } from "../../controller/firestoreController";
import { convertDateFormat } from "../../controller/formattedDate";

export default memo(function LecturerDetailAttendanceDatePage() {
  const { studentList, courseCode, currentDay, startDay } =
    useContext(LecturerContext);

  const [attendedList, setAttendedList] = useState([
    { name: "", attended: false },
  ]);

  const getAttendanceList = useCallback(async () => {
    if (studentList.length === 0) return;
    const attendanceListFC = await doGetAttendedListOfDate(
      studentList,
      courseCode,
      currentDay
    );
    setAttendedList(attendanceListFC);
  }, [studentList, courseCode, currentDay]);

  useEffect(() => {
    getAttendanceList();
  }, [getAttendanceList]);

  return (
    <div className="container mx-auto mt-8 overflow-scroll">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Số thứ tự</th>
              <th className="py-2 px-4 border-b">Tên</th>
              <th className="py-2 px-4 border-b">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {new Date(convertDateFormat(currentDay)) >=
              new Date(convertDateFormat(startDay)) &&
            currentDay &&
            attendedList ? (
              attendedList.map((student, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b text-center">
                    {index + 1}
                  </td>
                  <td className="py-2 px-4 border-b">{student.name}</td>
                  <td className="py-2 px-4 border-b">
                    {student.attended == "Present"
                      ? "Đã điểm danh"
                      : student.attended == "Absent"
                      ? "Chưa điểm danh"
                      : "Theo dõi"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-4 text-center">
                  Không có sinh viên nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

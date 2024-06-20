import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, memo } from "react";
import {
  doGetCourseDetail,
  doGetScheduleFromCourseID,
  doGetAttendStatusFromStudentID,
  doGetStudentAttendanceFromCourseID,
  doGetStudentFromParent,
  doGetScheduleListFromCourseID,
} from "../../controller/firestoreController";
import { formattedDate } from "../../controller/formattedDate";
import { useAuth } from "../../controller/authController";

export default memo(function ParentDetailCoursePage() {
  const { courseCode } = useParams();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [attended, setAttended] = useState("Absent");
  const [attendanceStats, setAttendanceStats] = useState({
    attended: 0,
    total: 0,
  });
  const [currentDay, setCurrentDay] = useState(formattedDate(new Date()));
  const [scheduleList, setScheduleList] = useState([]);

  const getScheduleList = useCallback(async () => {
    const scheduleList = await doGetScheduleListFromCourseID(courseCode);
    setScheduleList(scheduleList);
  }, [courseCode]);

  const getStudentList = useCallback(async () => {
    const studentListFC = await doGetStudentFromParent(currentUser.uid);
    if (studentListFC.length > 0) {
      getAttendanceStats(studentListFC[0].id);
      const attend = await doGetStudentAttendanceFromCourseID(
        courseCode,
        studentListFC[0].id,
        currentDay
      );
      setAttended(attend);
    }
  }, [currentUser.uid, courseCode, currentDay, getAttendanceStats]);

  const getCourseDetail = useCallback(async () => {
    const courseDetail = await doGetCourseDetail(courseCode);
    setCourse(courseDetail);
  }, [courseCode]);

  const getSchedule = useCallback(async () => {
    const schedule = await doGetScheduleFromCourseID(courseCode, currentDay);
    setSchedule(schedule);
  }, [courseCode, currentDay]);

  const getAttendanceStats = useCallback(
    async (studentID) => {
      const attendanceStats = await doGetAttendStatusFromStudentID(
        studentID,
        courseCode
      );
      setAttendanceStats(attendanceStats);
    },
    [courseCode]
  );

  useEffect(() => {
    getScheduleList();
    getStudentList();
    getCourseDetail();
    getSchedule();
  }, [getScheduleList, getStudentList, getCourseDetail, getSchedule]);

  return (
    <div className="h-[calc(100vh-70px-50px)] flex flex-col lg:flex-row justify-evenly p-8 bg-gray-50">
      <div className="flex flex-col justify-start items-center space-y-6 mt-8">
        <h2 className="text-2xl text-uit font-semibold mr-4 text-center">
          Môn học: {course.name}
        </h2>
        <div className="flex items-center justify-center border border-uit bg-white rounded-lg shadow-lg px-8 py-6 w-full lg:w-96">
          <div className="flex flex-col space-y-4 text-uit text-lg">
            <div className="flex justify-between">
              <span className="font-semibold mr-4">Giáo viên:</span>
              <span>{course.lecturerName}</span>
            </div>
            <div className="flex justify-between flex-col">
              <div className="flex flex-row justify-between">
                <span className="font-semibold mr-4 ">Ngày bắt đầu:</span>
                <span>{course.startDay}</span>
              </div>
            </div>
            <div className="flex flex-col justify-between items-center">
              <div className="flex justify-between">
                <span className="font-semibold mr-4">Từ:</span>
                <span>{course.startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold mr-4">Đến:</span>
                <span>{course.endTime}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold mr-4">Tuần học:</span>
              <span>{course.week} Tuần</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold mr-4">Phòng học:</span>
              <span>{course.roomID}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-start items-center space-y-6 mt-8">
        <h2 className="text-2xl text-uit font-semibold mr-4 text-center">
          Thông tin lịch học hôm nay: {currentDay}
        </h2>
        <div className="border border-uit bg-white rounded-lg shadow-lg p-4 font-bold text-xl text-uit">
          <select
            value={currentDay}
            onChange={(e) => setCurrentDay(e.target.value)}
          >
            <option value="">Select date</option>
            <option value={formattedDate(new Date())}>Hôm nay</option>
            {scheduleList &&
              scheduleList.map((date) => (
                <option key={date.id} value={date.date}>
                  {date.date}
                </option>
              ))}
          </select>
        </div>
        <div className="flex items-center justify-center border border-uit bg-white rounded-lg shadow-lg px-8 py-6 w-full lg:w-96">
          <div className="flex flex-col space-y-4 text-uit text-lg">
            {schedule && schedule.length !== 0 ? (
              <div key={schedule[0].id}>
                <div className="flex justify-between">
                  <span className="font-semibold ">Online URL:</span>
                  <span>{course.onlineURL}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold mr-1">
                    Trạng thái điểm danh:
                  </span>{" "}
                  {attended === "Present"
                    ? "Đã điểm danh"
                    : attended === "Absent"
                    ? "Chưa điểm danh"
                    : "Theo dõi"}
                </div>
              </div>
            ) : (
              <div className=" flex justify-center items-center font-bold text-red-500 text-xl ">
                Không có lịch học
              </div>
            )}
            <div className="flex justify-between border border-uit bg-white rounded-lg shadow-lg p-4">
              <span className="font-semibold mr-4">Trạng thái điểm danh:</span>
              <span className="font-semibold mr-4">
                <span className="text-green-500">
                  {attendanceStats.attended}
                </span>
                {" / "}
                <span className="text-red-500">{attendanceStats.total}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

import { useState, useEffect, useContext, memo } from "react";
import { LecturerContext } from "./lecturerDetailCoursePage";
import { convertDateFormat } from "../../controller/formattedDate";
import { db } from "../../config/firebaseConfig";
import {
  collection,
  where,
  query,
  documentId,
  onSnapshot,
} from "firebase/firestore";

export default memo(function LecturerDetailAttendanceDatePage() {
  const { studentList, courseCode, currentDay, startDay } =
    useContext(LecturerContext);

  const [attendedList, setAttendedList] = useState([
    { name: "", attended: "" },
  ]);

  useEffect(() => {
    let studentListID = [];
    if (studentList.length === 0) {
      console.log("No student in this course");
      return;
    }
    const queryStudent = query(
      collection(db, "student"),
      where(documentId(), "in", studentList)
    );
    const unsubscribeAttendance = onSnapshot(queryStudent, (snapshot) => {
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      // console.log("StudentListID:");
      studentListID = snapshot.docs.map((doc) => {
        // console.log(doc.id);
        return { id: doc.id, name: doc.data().name };
      });
      const querySchedule = query(
        collection(db, "schedule"),
        where("courseID", "==", courseCode),
        where("date", "==", currentDay)
      );
      onSnapshot(querySchedule, (snapshot) => {
        let scheduleID = "";
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }
        snapshot.docs.forEach((doc) => {
          scheduleID = doc.id;
        });

        if (scheduleID) {
          const attendanceRef = collection(db, "attendance");
          const attendancePromises = studentListID.map((student) => {
            return new Promise((resolve) => {
              const attendanceQuery = query(
                attendanceRef,
                where("studentID", "==", student.id),
                where("courseID", "==", courseCode),
                where("scheduleID", "==", scheduleID)
              );

              onSnapshot(attendanceQuery, (attendanceSnap) => {
                let attended = "Absent";
                attendanceSnap.forEach((doc) => {
                  attended = doc.data().attended;
                });
                resolve({ ...student, attended: attended });
              });
            });
          });

          Promise.all(attendancePromises).then((attendanceList) => {
            setAttendedList(attendanceList);
          });
        } else {
          setAttendedList([]);
        }
      });
    });
    return () => {
      unsubscribeAttendance();
    };
  }, [studentList, courseCode, currentDay]);

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
                      ? "Vắng mặt"
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

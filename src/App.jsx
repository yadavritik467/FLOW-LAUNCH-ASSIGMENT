import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddTaskForm from "./component/AddTaskForm";
import Loader from "./component/Loader";

const App = () => {
  const tableRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [load, setLoad] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    setLoad(true);
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((response) => response.json())
      .then((data) => {
        const onlyTwentyData = data.slice(0, 20).map((item) => ({
          id: item.id,
          title: item.title,
          description: `Description for task ${item.id}`,
          status: item?.completed ? "Done" : "To Do",
        }));
        setTasks(onlyTwentyData);
        setFilteredTasks(onlyTwentyData);
        setLoad(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoad(false);
      });
  }, []);

  // Initialize Tabulator Table
  useEffect(() => {
    if (tableRef.current && filteredTasks?.length) {
      const table = new Tabulator(tableRef.current, {
        data: filteredTasks,
        debugInvalidOptions: false,
        layout: "fitColumns",
        columns: [
          { title: "Task ID", field: "id" },
          {
            title: "Title",
            field: "title",
            editor: "input",
          },
          {
            title: "Description",
            field: "description",
            editor: "input",
          },
          {
            title: "Status",
            field: "status",
            editor: "list",

            editorParams: {
              values: ["To Do", "In Progress", "Done"],
            },
          },
          {
            title: "Actions",
            hozAlign: "left",
            formatter: (cell) => {
              const taskId = cell.getRow().getData().id;
              return `<button id="deleteBtn-${taskId}" class="delete-btn bg-red-500 text-white px-2 py-1 rounded">Delete</button>`;
            },
          },
        ],
      });

      // cellEdited event listener
      table.on("cellEdited", (cell) => {
        const field = cell.getField();
        const value = cell.getValue();
        const rowData = cell.getRow().getData();
        let updatedTasks = [];
        if (field === "title") {
          updatedTasks = tasks.map((ts) =>
            ts.id === rowData.id ? { ...ts, title: value } : ts
          );
          toast.success("Title has been updated", { autoClose: 1500 });
        } else if (field === "description") {
          updatedTasks = tasks.map((ts) =>
            ts.id === rowData.id ? { ...ts, description: value } : ts
          );
          toast.success("Description has been updated", { autoClose: 1500 });
        } else if (field === "status") {
          updatedTasks = tasks.map((ts) =>
            ts.id === rowData.id ? { ...ts, status: value } : ts
          );
          toast.success("Status has been updated", { autoClose: 1500 });
        }
        setTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
      });

      const handleDeleteClick = (e) => {
        if (e.target && e.target.classList.contains("delete-btn")) {
          const taskId = Number(e.target.id.replace("deleteBtn-", ""));
          deleteTask(taskId);
        }
      };
      tableRef.current.removeEventListener("click", handleDeleteClick);
      tableRef.current.addEventListener("click", handleDeleteClick);

      return () => {
        table.destroy();
        tableRef.current.removeEventListener("click", handleDeleteClick); // Cleanup listener when component unmounts
      };
    }
  }, [filteredTasks?.length]);

  // Add Task
  const addTask = (title, description) => {
    const taskId = Math.floor(Math.random(10 * 2) * 1000);
    const newTask = {
      id: taskId,
      title,
      description,
      status: "To Do",
    };
    setTasks((prev) => [...prev, newTask]);
    setFilteredTasks((prev) => [...prev, newTask]);
    toast.success("Task created !!", { autoClose: 1500 });
  };

  // Delete Task
  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    toast.success("Task Deleted !!", { autoClose: 1500 });
  };

  // Filter Tasks by Status
  const filterTasks = (status) => {
    setStatusFilter(status);
    if (!status) {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter((task) => task.status === status);
      setFilteredTasks(filtered);
    }
  };

  const searchFilter = (e) => {
    const val = e?.target?.value;
    if (e?.nativeEvent?.inputType === "deleteContentBackward") {
      return setFilteredTasks(tasks);
    }
    const filterArr = filteredTasks?.filter((ts) =>
      ts?.title.toLowerCase()?.includes(val?.toLowerCase())
    );
    setFilteredTasks(filterArr);
  };

  const totalTaskCountStatusWise = (str) => {
    return tasks?.filter((ts) => ts?.status === str)?.length;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Task List Manager</h1>

      {/* Add Task Form */}
      <div className="mb-4">
        <AddTaskForm onAddTask={addTask} />
      </div>

      {/* Filter Bar */}
      <div className="flex max-sm:flex-col gap-2 sm:items-center">
        <input
          type="text"
          onChange={(e) => searchFilter(e)}
          placeholder="Search title"
          className="p-2 border rounded-md"
        />
        <div className=" flex gap-4 items-center">
          <label htmlFor="status-filter" className="font-medium">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => filterTasks(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
      <div className="flex gap-4 py-3">
        <p> To Do : {totalTaskCountStatusWise("To Do")} </p>
        <p> In Progress : {totalTaskCountStatusWise("In Progress")} </p>
        <p> Done : {totalTaskCountStatusWise("Done")} </p>
      </div>

      {/* Task Table */}
      {load ? (
        <div className="w-full flex justify-center items-center py-4">
          <Loader />
        </div>
      ) : (
        <div className="table-wrapper">
          <div ref={tableRef}></div>
        </div>
      )}
      {!filteredTasks?.length && !load && (
        <div className="flex justify-center items-center h-10 border border-gray-300 rounded-md bg-gray-100">
          <p className="text-lg text-gray-600 font-semibold">No Data Found</p>
        </div>
      )}
    </div>
  );
};

export default App;

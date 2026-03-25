import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { useEffect, useRef, useState } from "react";
import { addNote, deleteNoteFunc, fetchNotes, updateNoteFunc } from "../features/notes/notesSlice";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../stripe/stripe";
import CheckoutForm from "../components/StripeForm";

const Dashboard = () => {
    const { user, token } = useSelector((state) => state.auth);
    const { notes, loading, currentPage, hasMore, totalPages } = useSelector((state) => state.notes);
    const dispatch = useDispatch();
    const [isCreateNote, setIsCreateNote] = useState(false)
    const containerRef = useRef(null);
    const [noteDetail, setNoteDetail] = useState({
        title: "",
        content: ""
    })

    const handleChange = (e) => {
        setNoteDetail({ ...noteDetail, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (token) {
            dispatch(fetchNotes({ page: 1, limit: 5 }));
        }
    }, [token]);

    useEffect(() => {
        const handleScroll = () => {
            const isNearBottom =
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 500 &&
                notes.length < totalPages

            if (isNearBottom) {
                dispatch(fetchNotes({ page: currentPage + 1, limit: 5 }));
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [loading, hasMore, currentPage]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (noteDetail?.id) {
                await dispatch(updateNoteFunc(noteDetail)).unwrap();
            } else {
                await dispatch(addNote(noteDetail)).unwrap();
            }

            setIsCreateNote(false);
            setNoteDetail({ title: "", content: "" });

        } catch (err) {
            console.error("Error:", err);
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure want to delete the note?")) return;
        dispatch(deleteNoteFunc(id));
    };

    const handleComplete = (note) => {
        dispatch(updateNoteFunc({ id: note?._id, completed: !note?.completed }));
    };

    const handleUpdate = (note) => {
        setIsCreateNote(true);
        setNoteDetail({
            title: note.title,
            content: note.content,
            id: note._id
        })
    }

    return (
        <div className="min-h-screen py-10 items-center flex flex-col justify-between gap-10">
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-black text-[60px] text-center">Welcome, {user?.name ?? "..."}</h1>

                {isCreateNote &&
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-[350px] mx-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[34px]">{noteDetail?.id ? "Edit" : "Create"} note</h2>
                            <button
                                className="w-8 h-8 rounded-full border border-[#000]"
                                onClick={() => {
                                    setIsCreateNote(false)
                                    setNoteDetail({ title: "", content: "" })
                                }}
                            >
                                ❌
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input
                                name="title"
                                type="text"
                                placeholder="Enter title"
                                value={noteDetail.title}
                                onChange={handleChange}
                                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />

                            <textarea
                                value={noteDetail.content}
                                placeholder="Enter content"
                                onChange={handleChange}
                                className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                name="content" />

                            <button
                                type="submit"
                                className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                            >
                                {loading ? "Saving..." : noteDetail?.id ? "Update" : "Create"}
                            </button>
                        </form>
                    </div>
                }
                <div className="bg-white p-8 rounded-3xl shadow-2xl w-[90%] mx-auto" ref={containerRef}>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Notes</h2>

                        <button
                            onClick={() => setIsCreateNote(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                        >
                            + Add
                        </button>
                    </div>

                    {notes?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 pr-1">
                            {notes?.map((note) => (
                                <div
                                    key={note?._id}
                                    className={`bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${note?.completed && "opacity-60"}`}
                                >
                                    {/* Title */}
                                    <div className="flex justify-between items-center">
                                        <h4 className={`text-lg font-semibold text-gray-800 ${note?.completed && "line-through"}`}>
                                            {note?.title}
                                        </h4>

                                        {note?.completed ?
                                            <div className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                                                ✓ Completed
                                            </div> :
                                            <button
                                                className="bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-indigo-700 transition"
                                                onClick={() => handleUpdate(note)}
                                            >
                                                ✎ Edit
                                            </button>
                                        }
                                    </div>

                                    {/* Content */}
                                    <p
                                        className={`mt-2 text-gray-600 text-sm leading-relaxed line-clamp-3 ${note?.completed && "line-through"
                                            }`}
                                    >
                                        {note?.content}
                                    </p>

                                    {/* Footer Actions */}
                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                                        <span className={`text-xs text-gray-400 ${note?.completed && "line-through"}`}>Note</span>

                                        <div className="flex gap-2">
                                            <button
                                                className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${note?.completed ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                                                onClick={() => handleComplete(note)}
                                            >
                                                ✓ {note?.completed ? "Mark not completed" : "Mark as done"}
                                            </button>

                                            <button
                                                className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-red-200 transition"
                                                onClick={() => handleDelete(note?._id)}
                                            >
                                                🗑 Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500 text-sm mb-3">No notes found</p>
                            <button
                                onClick={() => setIsCreateNote(true)}
                                className="text-indigo-600 font-medium hover:underline"
                            >
                                Create one
                            </button>
                        </div>
                    )}
                </div>

                <Elements stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>

            </div>
            <button
                onClick={() => dispatch(logout())}
                className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-700 ease-in-out rounded-full px-6 h-[36px] flex items-center justify-center text-white">
                Logout
            </button>
        </div>
    )
}

export default Dashboard
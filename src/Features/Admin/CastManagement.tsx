import React, { useState, FormEvent } from "react";
import { useAddCastMutation, useGetCastQuery, useDeleteCastMutation, useUpdateCastMutation } from "../../Store/AdminApiSlice";
import AdminLayout from "./AdminLayout";
import { toast } from "react-toastify";
import { FaTrash, FaPlus, FaTimes, FaUserTie } from "react-icons/fa";
import Loader from "../../Features/User/Loader";
import { backendUrl } from "../../url";
import { ICast } from "../../Core/MoviesTypes";

const CastManagement: React.FC = () => {
    const [name, setName] = useState("");
    const [role, setRole] = useState<"Actor" | "Director">("Actor");
    const [image, setImage] = useState<File | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);

    const { data: castList, isLoading, refetch } = useGetCastQuery(undefined);
    const [addCast, { isLoading: isAdding }] = useAddCastMutation();
    const [updateCast, { isLoading: isUpdating }] = useUpdateCastMutation();
    const [deleteCast] = useDeleteCastMutation();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImage(file);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name) {
            toast.error("Name is required");
            return;
        }

        if (!editingId && !image) {
            toast.error("Image is required for new cast");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("role", role);
        if (image) formData.append("image", image);

        try {
            if (editingId) {
                await updateCast({ id: editingId, data: formData }).unwrap();
                toast.success("Cast updated successfully");
            } else {
                await addCast(formData).unwrap();
                toast.success("Cast added successfully");
            }

            setShowModal(false);
            resetForm();
            refetch();
        } catch (error) {
            toast.error(editingId ? "Failed to update cast" : "Failed to add cast");
        }
    };

    const resetForm = () => {
        setName("");
        setRole("Actor");
        setImage(null);
        setEditingId(null);
    };

    const handleEdit = (person: ICast) => {
        setName(person.name);
        setRole(person.role);
        setEditingId(person._id);
        setShowModal(true);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure?")) {
            try {
                await deleteCast(id).unwrap();
                toast.success("Cast deleted");
                refetch();
            } catch (error) {
                toast.error("Failed to delete cast");
            }
        }
    };

    const filteredCast = castList?.filter((person: ICast) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const directors = filteredCast?.filter((person: ICast) => person.role === "Director");
    const actors = filteredCast?.filter((person: ICast) => person.role === "Actor");

    if (isLoading) return <Loader />;

    return (
        <AdminLayout adminName="">
            <div className="p-8 w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FaUserTie /> Cast & Crew Management
                    </h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search cast..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={openAddModal}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                        >
                            <FaPlus /> Add New
                        </button>
                    </div>
                </div>

                {/* Directors Section */}
                {directors && directors.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 px-1 border-l-4 border-blue-500 pl-3">Directors</h2>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {directors.map((person: ICast) => (
                                <CastCard key={person._id} person={person} onDelete={handleDelete} onEdit={handleEdit} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Actors Section */}
                {actors && actors.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 px-1 border-l-4 border-green-500 pl-3">Actors</h2>
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {actors.map((person: ICast) => (
                                <CastCard key={person._id} person={person} onDelete={handleDelete} onEdit={handleEdit} />
                            ))}
                        </div>
                    </div>
                )}

                {(!filteredCast || filteredCast.length === 0) && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No cast members found matching your search.
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            >
                                <FaTimes />
                            </button>
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                {editingId ? "Edit Cast Member" : "Add Cast Member"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        placeholder="e.g. Tom Cruise"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as "Actor" | "Director")}
                                        className="w-full mt-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="Actor">Actor</option>
                                        <option value="Director">Director</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full mt-1"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isAdding || isUpdating}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {isAdding || isUpdating ? "Saving..." : (editingId ? "Update Cast" : "Add Cast")}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

const CastCard = ({ person, onDelete, onEdit }: { person: ICast; onDelete: (id: string) => void; onEdit: (person: ICast) => void }) => (
    <div
        onClick={() => onEdit(person)}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden group relative flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
        <div className="aspect-[2/3] w-full overflow-hidden">
            <img
                src={`${backendUrl}/CastsImages/${person.image}`}
                alt={person.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
        </div>
        <div className="p-3 flex-1 flex flex-col justify-end bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 w-full">
            <h3 className="font-bold text-sm text-white truncate">{person.name}</h3>
            <p className="text-xs text-gray-300">{person.role}</p>
        </div>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onDelete(person._id);
            }}
            className="absolute top-1 right-1 bg-red-600/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
        >
            <FaTrash size={12} />
        </button>
    </div>
);

export default CastManagement;

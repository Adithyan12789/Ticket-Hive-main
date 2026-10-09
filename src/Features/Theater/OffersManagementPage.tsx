import { useState, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import Loader from "../../Features/User/Loader";
import { toast } from "react-toastify";
import {
  useGetOffersQuery,
  useAddOfferMutation,
  useGetTheatersMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} from "../../Store/TheaterApiSlice";
import { Offer, Theater } from "../../Core/TheaterTypes";
import TheaterSidebar from "./TheaterSideBar";
import Select, { MultiValue } from "react-select";
import { RootState } from "../../Store";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useCallback } from "react";

interface TheaterOption {
  value: string;
  label: string;
}

const OfferManagementPage: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [offerName, setOfferName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [offerDescription, setOfferDescription] = useState<string>("");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(0);
  const [validityStart, setValidityStart] = useState<Date>(new Date());
  const [validityEnd, setValidityEnd] = useState<Date>(new Date());
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [selectedTheaters, setSelectedTheaters] = useState<string[]>([]);

  const { theaterInfo } = useSelector((state: RootState) => state.theaterAuth);

  const {
    data: offers,
    isLoading: offersLoading,
    refetch,
  } = useGetOffersQuery({});

  const [addOffer, { isLoading: addOfferLoading }] = useAddOfferMutation();
  const [updateOffer] = useUpdateOfferMutation();
  const [deleteOffer] = useDeleteOfferMutation();
  const [getTheaters, { isLoading }] = useGetTheatersMutation();

  const fetchData = useCallback(async () => {
    try {
      const response = await getTheaters({}).unwrap();
      setTheaters(response);
    } catch (err) {
      console.error("Error fetching theaters", err);
    }
  }, [getTheaters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    document.title = "Ticket Hive - Offer Management";
  }, []);

  const ownerId = theaterInfo?.id;

  const resetFormFields = () => {
    setOfferName("");
    setPaymentMethod("");
    setOfferDescription("");
    setDiscountValue(0);
    setMinPurchaseAmount(0);
    setValidityStart(new Date());
    setValidityEnd(new Date());
    setSelectedTheaters([]);
  };

  const validateForm = (): boolean => {
    if (!ownerId) {
      toast.error("Owner ID is missing.");
      return false;
    }
    if (!offerName) {
      toast.error("Offer name is required.");
      return false;
    }
    if (!paymentMethod) {
      toast.error("Payment method is required.");
      return false;
    }
    if (!offerDescription) {
      toast.error("Offer description is required.");
      return false;
    }
    if (discountValue <= 0) {
      toast.error("Discount value must be greater than 0.");
      return false;
    }
    if (!validityStart) {
      toast.error("Validity start date is required.");
      return false;
    }
    if (!validityEnd) {
      toast.error("Validity end date is required.");
      return false;
    }
    if (selectedTheaters.length === 0) {
      toast.error("At least one theater must be selected.");
      return false;
    }
    return true;
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ownerId,
      offerName,
      paymentMethod,
      offerDescription,
      discountValue,
      minPurchaseAmount,
      validityStart: validityStart.toISOString(),
      validityEnd: validityEnd.toISOString(),
      applicableTheaters: selectedTheaters,
    };

    try {
      await addOffer(payload).unwrap();
      toast.success("Offer added successfully!");
      resetFormFields();
      setShowModal(false);
      fetchData();
      refetch();
    } catch (error) {
      console.log("Error adding offer:", error);
      toast.error("Failed to add offer. Please try again.");
    }
  };


  const handleEditModalShow = (offer: Offer) => {

    if (!offer._id) {
      toast.error("Offer ID is missing in the provided offer object");
      console.error("Offer ID is missing in the provided offer object", offer);
      return;
    }

    console.error("offer", offer._id);

    setOfferId(offer._id);
    setOfferName(offer.offerName || "");
    setPaymentMethod(offer.paymentMethod || "");
    setOfferDescription(offer.description || "");
    setDiscountValue(offer.discountValue ?? 0);
    setMinPurchaseAmount(offer.minPurchaseAmount ?? 0);
    setValidityStart(new Date(offer.validityStart || new Date()));
    setValidityEnd(new Date(offer.validityEnd || new Date()));
    setSelectedTheaters(offer.applicableTheaters || []);
    setShowEditModal(true);
  };

  console.log("offerId", offerId);

  const submitEditHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offerId) {
      toast.error("Offer ID is missing.");
      return;
    }

    if (
      !ownerId ||
      !paymentMethod ||
      !offerName ||
      !offerDescription ||
      discountValue <= 0 ||
      !validityStart ||
      !validityEnd ||
      selectedTheaters.length === 0
    ) {
      toast.error("Please fill all fields with valid values.");
      return;
    }

    const data = {
      ownerId,
      offerName,
      paymentMethod,
      offerDescription,
      discountValue,
      minPurchaseAmount,
      validityStart: validityStart.toISOString(),
      validityEnd: validityEnd.toISOString(),
      applicableTheaters: selectedTheaters,
    };

    try {
      await updateOffer({ offerId, data }).unwrap();
      toast.success("Offer edited successfully!");
      setShowModal(false);
      fetchData();
      refetch();
    } catch (error) {
      console.log("Error editing offer:", error);
      toast.error("Failed to edit offer. Please try again.");
    }
  };

  const handleCloseModal = () => {
    resetFormFields();
    setShowModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const theaterOptions = theaters.map((theater) => ({
    value: theater._id,
    label: theater.name,
  }));

  const handleTheaterSelection = (
    selectedOptions: MultiValue<TheaterOption>
  ) => {
    setSelectedTheaters(selectedOptions.map((option) => option.value));
  };

  const handleDelete = async (offerId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteOffer({ offerId }).unwrap();
        toast.success("Offer deleted successfully");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  if (offersLoading || isLoading) return <Loader />;

  return (
    <div style={{ padding: "20px" }}>
      <Container fluid style={{ marginTop: "20px" }}>
        <Row style={{ marginTop: "20px", justifyContent: "center" }}>
          <Col md={3}>
            <TheaterSidebar />
          </Col>
          <Col md={9}>
            <Card style={{ boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
              <Card.Body>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h4 style={{ marginBottom: 0 }}>Manage Offers</h4>
                  <Button
                    style={{
                      backgroundColor: "#007bff",
                      border: "none",
                      padding: "10px 20px",
                    }}
                    onClick={() => setShowModal(true)}
                  >
                    Add Offer
                  </Button>
                </div>
                {offers?.length ? (
                  <Row className="gy-4">
                    {offers.map((offer: Offer) => (
                      <Col md={6} lg={4} key={offer._id}>
                        <Card
                          style={{
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            border: "none",
                          }}
                        >
                          <Card.Body>
                            <h5
                              style={{
                                fontWeight: "bold",
                                marginBottom: "20px",
                              }}
                            >
                              {offer.offerName}
                            </h5>
                            <p
                              style={{ color: "#6c757d", marginBottom: "20px" }}
                            >
                              {offer.description}
                            </p>
                            <p
                              style={{ fontSize: "14px", marginBottom: "20px" }}
                            >
                              <strong>Payment Method: </strong>{" "}
                              {offer.paymentMethod}
                            </p>
                            <p
                              style={{ fontSize: "14px", marginBottom: "20px" }}
                            >
                              <strong>Discount: </strong> {offer.discountValue}%
                            </p>
                            {offer.minPurchaseAmount !== undefined &&
                              offer.minPurchaseAmount > 0 && (
                                <strong>
                                  Min Purchase: ${offer.minPurchaseAmount}
                                </strong>
                              )}
                            <p
                              style={{
                                fontSize: "14px",
                                marginBottom: "20px",
                                marginTop: "20px",
                              }}
                            >
                              <strong>Validity: </strong>
                              {new Date(
                                offer.validityStart
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(offer.validityEnd).toLocaleDateString()}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "30px",
                              }}
                            >
                              <Button
                                variant="outline-primary"
                                size="sm"
                                style={{ fontSize: "12px" }}
                                key={offer._id}
                                onClick={() => handleEditModalShow(offer)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                style={{ fontSize: "12px" }}
                                onClick={() => handleDelete(offer._id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <p>No offers available. Add some to get started!</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitHandler}>
            <Row>
              {/* Left Column */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="offerName">
                  <Form.Label>Offer Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter offer name"
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="offerType">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Control
                    as="select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginBottom: "10px" }}
                  >
                    <option value="Razorpay">Razorpay</option>
                    <option value="Paypal">Paypal</option>
                    <option value="Wallet">Wallet</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId="offerDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter offer description"
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="discountValue">
                  <Form.Label>Discount Value</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter discount value"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>
              </Col>

              {/* Right Column */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="minPurchaseAmount">
                  <Form.Label>Minimum Purchase Amount</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter minimum purchase amount"
                    value={minPurchaseAmount}
                    onChange={(e) =>
                      setMinPurchaseAmount(Number(e.target.value))
                    }
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="validityStart">
                  <Form.Label>Validity Start</Form.Label>
                  <Form.Control
                    type="date"
                    value={validityStart.toISOString().split("T")[0]}
                    onChange={(e) => setValidityStart(new Date(e.target.value))}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="validityEnd">
                  <Form.Label>Validity End</Form.Label>
                  <Form.Control
                    type="date"
                    value={validityEnd.toISOString().split("T")[0]}
                    onChange={(e) => setValidityEnd(new Date(e.target.value))}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="applicableTheaters">
                  <Form.Label>Applicable Theaters</Form.Label>
                  <Select
                    options={theaterOptions}
                    isMulti
                    value={theaterOptions.filter((option) =>
                      selectedTheaters.includes(option.value)
                    )}
                    onChange={handleTheaterSelection}
                    placeholder="Select applicable theaters..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        marginBottom: "10px",
                      }),
                    }}
                  />
                </Form.Group>
                ;
              </Col>
            </Row>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={addOfferLoading}
              >
                {addOfferLoading ? "Adding..." : "Add Offer"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitEditHandler}>
            <Row>
              {/* Left Column */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="offerName">
                  <Form.Label>Offer Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter offer name"
                    value={offerName}
                    onChange={(e) => setOfferName(e.target.value)}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="offerType">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Control
                    as="select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ marginBottom: "10px" }}
                  >
                    <option value="Razorpay">Razorpay</option>
                    <option value="Paypal">Paypal</option>
                    <option value="Wallet">Wallet</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3" controlId="offerDescription">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter offer description"
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="discountValue">
                  <Form.Label>Discount Value</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter discount value"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>
              </Col>

              {/* Right Column */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="minPurchaseAmount">
                  <Form.Label>Minimum Purchase Amount</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter minimum purchase amount"
                    value={minPurchaseAmount}
                    onChange={(e) =>
                      setMinPurchaseAmount(Number(e.target.value))
                    }
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="validityStart">
                  <Form.Label>Validity Start</Form.Label>
                  <Form.Control
                    type="date"
                    value={validityStart.toISOString().split("T")[0]}
                    onChange={(e) => setValidityStart(new Date(e.target.value))}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="validityEnd">
                  <Form.Label>Validity End</Form.Label>
                  <Form.Control
                    type="date"
                    value={validityEnd.toISOString().split("T")[0]}
                    onChange={(e) => setValidityEnd(new Date(e.target.value))}
                    style={{ marginBottom: "10px" }}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="applicableTheaters">
                  <Form.Label>Applicable Theaters</Form.Label>
                  <Select
                    options={theaterOptions}
                    isMulti
                    value={theaterOptions.filter((option) =>
                      selectedTheaters.includes(option.value)
                    )}
                    onChange={handleTheaterSelection}
                    placeholder="Select applicable theaters..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        marginBottom: "10px",
                      }),
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={addOfferLoading}
              >
                {addOfferLoading ? "Updating..." : "Update Offer"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OfferManagementPage;

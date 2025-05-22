import { Modal, Button, Form } from 'react-bootstrap';
import Cropper from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';

function ImageCropModal({ show, handleClose, rawImage, cropperRef, cropImage }) {
    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Crop Profile Picture</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {rawImage && (
                    <>
                        <Cropper
                            src={rawImage}
                            style={{ height: 400, width: '100%' }}
                            aspectRatio={1}
                            viewMode={1}
                            guides={false}
                            background={true}
                            dragMode="move"
                            scalable={true}
                            zoomable={true}
                            cropBoxResizable={true}
                            cropBoxMovable={true}
                            ref={cropperRef}
                        />
                        <div className="text-center mt-3">
                            <Button variant="primary" className="me-2" onClick={cropImage}>
                                Crop Image
                            </Button>
                             <Button  variant="secondary" onClick={handleClose}>Cancel</Button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default ImageCropModal;
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
                            background={false}
                            dragMode="move"
                            scalable={true}
                            zoomable={true}
                            // cropBoxResizable={false}
                            // cropBoxMovable={false}
                            ref={cropperRef}
                        />
                        <div className="text-center mt-3">
                            <Button variant="primary" onClick={cropImage}>
                                Crop Image
                            </Button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default ImageCropModal;
import { Box, Modal } from "@mui/material";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: any;
  component: any;
  setRoute?: (route: string) => void;
};

const CustomModal = ({
  open,
  setOpen,
  activeItem,
  component: Component,
  setRoute,
}: Props) => {
  return (
    <Modal
    sx={{
      overflow:"scroll"
    }}
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className="absolute top-[70%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
        <Component setOpen={setOpen} setRoute={setRoute} />
      </Box>
    </Modal>
  );
};

export default CustomModal;

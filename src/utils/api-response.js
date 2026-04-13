class ApiResponse {
    static health(res, message="Still Alive, Still Breathing!", data = null){
        return res.status(200).json({
            success: true,
            message,
            data,
        })
    }
    static ok(res, message = "Request Successful", data = null) {
        return res.status(200).json({
            success: true,
            message,
            data,
        });
    }

    static created(res, message, data = null) {
        return res.status(201).json({
            success: true,
            message,
            data,
        });
    }

    static noContent(res) {
        return res.status(204).send();
    }
}

export default ApiResponse;

use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_cdk_macros::{update, query, init};
use ic_cdk::storage;

#[derive(CandidType, Deserialize)]
pub struct PutMetaInfo{
    pub name: String,
    pub description: String,
    pub chunk_num: usize,
}

#[derive(CandidType, Deserialize)]
pub struct MetaInfo{
    pub name: String,
    pub description: String,
    pub chunk_num: usize,
    pub version: usize,
    pub owner: Principal,
}

impl Default for MetaInfo{
    fn default() -> Self { 
        MetaInfo{
            name: String::new(),
            description: String::new(),
            chunk_num: 0,
            version: CANISTER_VERSION,
            owner: Principal::anonymous(),
        }
     }
}

#[derive(CandidType, Deserialize)]
pub enum PutMetaInfoResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,
}

#[derive(CandidType, Deserialize)]
pub enum PutChunkResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,

    #[serde(rename = "out_of_bounds")]
    OutOfBounds
}

#[derive(CandidType, Deserialize)]
pub enum ChangeOwnerResponse{
    #[serde(rename = "success")]
    Success,

    #[serde(rename = "missing_rights")]
    MissingRights,
}

type Chunk = Vec<u8>;
type Chunks = Vec<Chunk>;

const CANISTER_VERSION: usize = 1usize;

#[init]
pub async fn init(owner: Principal){
    *storage::get_mut::<MetaInfo>() = MetaInfo{
        name: String::new(),
        description: String::new(),
        chunk_num: 0,
        version: CANISTER_VERSION,
        owner,
    };
}

#[update]
pub async fn put_meta_info(new_meta_info: PutMetaInfo) -> PutMetaInfoResponse{
    let mut old_meta_info = storage::get_mut::<MetaInfo>();
    if old_meta_info.owner != ic_cdk::caller() {
        return PutMetaInfoResponse::MissingRights;
    } else {
        old_meta_info.name = new_meta_info.name;
        old_meta_info.description = new_meta_info.description;

        //Resize array
        if old_meta_info.chunk_num != new_meta_info.chunk_num{
            (*storage::get_mut::<Chunks>()).resize(new_meta_info.chunk_num, Vec::new());
            old_meta_info.chunk_num = new_meta_info.chunk_num;
        }

        return PutMetaInfoResponse::Success;
    }
}

#[update]
pub async fn put_chunk(chunk_num: usize, chunk: Chunk) -> PutChunkResponse{
    let owner = (*storage::get::<MetaInfo>()).owner;
    if owner != ic_cdk::caller() {
        return PutChunkResponse::MissingRights;
    } else {
        let chunks = storage::get_mut::<Chunks>();

        if chunks.len() >= chunk_num{
            return PutChunkResponse::OutOfBounds;
        }
        
        chunks[chunk_num] = chunk;
        return PutChunkResponse::Success;
    }
}

#[update]
pub async fn change_owner(new_owner: Principal) -> ChangeOwnerResponse{
    let mut old_owner = (*storage::get_mut::<MetaInfo>()).owner;

    if old_owner != ic_cdk::caller() {
        return ChangeOwnerResponse::MissingRights;
    } else {
        old_owner = new_owner;
        return ChangeOwnerResponse::Success;
    }
}
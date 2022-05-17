use ic_cdk::export::candid::{CandidType, Deserialize, Principal,};
use ic_cdk_macros::{update, query, init, pre_upgrade, post_upgrade};
use ic_cdk::storage;

use std::cell::RefCell;

const CANISTER_VERSION: usize = 0usize;

type Chunk = Vec<u8>;
type Chunks = Vec<Chunk>;

#[derive(CandidType, Deserialize)]
pub struct PutMetaInfo {
    pub name: Option<String>,
    pub description: Option<String>,
    pub chunk_num: Option<usize>,
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

impl Clone for MetaInfo{
    fn clone(&self) -> Self {
        MetaInfo{
            name: self.name.clone(),
            description: self.description.clone(),
            chunk_num: self.chunk_num,
            version: self.version,
            owner: self.owner,
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

thread_local! {
    static META_INFO: RefCell<MetaInfo> = RefCell::new(MetaInfo::default());
    static CHUNKS: RefCell<Chunks> = RefCell::new(Chunks::new());
}

#[init]
pub async fn init(owner: Principal){
    META_INFO.with(|meta_info| {
        meta_info.borrow_mut().owner = owner;
    });
}

#[update]
pub async fn put_meta_info(new_meta_info: PutMetaInfo) -> PutMetaInfoResponse {
    if META_INFO.with(|meta_info| meta_info.borrow().owner != ic_cdk::caller()) {
        return PutMetaInfoResponse::MissingRights;
    }
    META_INFO.with(|meta_info| {
        let mut existing_meta_info = meta_info.borrow_mut();

        if let Some(chunk_num) = new_meta_info.chunk_num {
            if existing_meta_info.chunk_num != chunk_num {
                //Resize chunk array
                CHUNKS.with(|chunks| {
                    chunks.borrow_mut().resize(chunk_num, vec![]);
                });
                existing_meta_info.chunk_num = chunk_num;
            }
        }
            
        if let Some(name) = new_meta_info.name {
            existing_meta_info.name = name;
        }

        if let Some(description) = new_meta_info.description {
            existing_meta_info.description = description;
        }
    });
    return PutMetaInfoResponse::Success;
}

#[update]
pub async fn put_chunk(chunk_num: usize, chunk: Chunk) -> PutChunkResponse{
    if META_INFO.with(|meta_info| meta_info.borrow().owner != ic_cdk::caller()){ 
        return PutChunkResponse::MissingRights;
    }
    return CHUNKS.with(|chunks| {
        if chunk_num >= chunks.borrow().len(){
            return PutChunkResponse::OutOfBounds
        };
        
        chunks.borrow_mut()[chunk_num] = chunk;
        return PutChunkResponse::Success
    });
}

#[update]
pub async fn change_owner(new_owner: Principal) -> ChangeOwnerResponse{
    META_INFO.with(|meta_info|{
        if meta_info.borrow().owner != ic_cdk::caller() {
            return ChangeOwnerResponse::MissingRights;
        } else { 
            meta_info.borrow_mut().owner = new_owner;
            return ChangeOwnerResponse::Success;
        }
    })
}

#[query]
pub async fn get_meta_info() -> MetaInfo{
    return META_INFO.with(|meta_info|{
        meta_info.borrow().clone()
    });
}

#[query]
pub async fn get_chunk(chunk_num: usize) -> Option<Chunk>{
    return CHUNKS.with(|chunks|{
        chunks.borrow().get(chunk_num).map(|chunk|
            chunk.clone()
        )
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    CHUNKS.with(|chunks|{
        META_INFO.with(|meta_info|{
            let pair = (meta_info, chunks);
            storage::stable_save((pair,)).unwrap();
        })
    });
}

#[post_upgrade]
fn post_upgrade() {
    let ((old_meta_info, old_chunks),): ((MetaInfo, Chunks),) = storage::stable_restore().unwrap();

    META_INFO.with(|wrapped_meta_info|{
        let mut meta_info = wrapped_meta_info.borrow_mut();
        meta_info.chunk_num = old_meta_info.chunk_num;
        meta_info.description = old_meta_info.description;
        meta_info.owner = old_meta_info.owner;
        meta_info.name = old_meta_info.name;
    });

    CHUNKS.with(|chunks|{
       *chunks.borrow_mut() = old_chunks;
    });
}